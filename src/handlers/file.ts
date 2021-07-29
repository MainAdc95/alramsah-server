import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const fileQuery = (
    filter: string,
    order: string,
    limit: string,
    offset: string
) => `
    SELECT
        f.file_id,
        f.text,
        f.created_at,
        f.updated_at,
        jsonb_build_object (
            'user_id', cb.user_id,
            'username', cb.username
        ) as created_by,
        jsonb_build_object (
            'user_id', ub.user_id,
            'username', ub.username
        ) as updated_by,
        CASE WHEN count(i)=0 THEN null ELSE jsonb_build_object (
            'image_id', i.image_id,
            'sizes', i.sizes
        ) END AS image
    FROM files f
        LEFT JOIN users cb ON cb.user_id=f.created_by
        LEFT JOIN users ub ON ub.user_id=f.updated_by
        LEFT JOIN images i ON i.image_id=f.image_id
    ${filter || ""}
    GROUP BY f.file_id, cb.user_id, ub.user_id, i.image_id
    ${order || "ORDER BY f.created_at desc"}
    ${limit || ""}
    ${offset || ""}
`;

export async function getFile(req: Request, res: Response, next: NextFunction) {
    try {
        const { fileId } = req.params;

        const {
            rows: [file],
        } = await pool.query(fileQuery("WHERE f.file_id=$1", "", "", ""), [
            fileId,
        ]);

        return res.status(200).json(file);
    } catch (err) {
        return next(err);
    }
}

const sum = (times: number, value: number) => {
    let totalValue = 0;

    for (let i = 0; i < times; i++) {
        totalValue += value;
    }

    return totalValue - value;
};

export async function getFiles(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { p, r }: any = req.query;

        p = Number(p);
        r = r ? Number(r) : 20;

        let {
            rows: [{ results }],
        } = await pool.query(`SELECT count(*) as results FROM files`);

        results = Number(results);

        const { rows: files } = await pool.query(
            fileQuery("", "", r ? `LIMIT ${r}` : "", `OFFSET ${sum(p, r)}`)
        );

        return res.status(200).json({
            results,
            files,
        });
    } catch (err) {
        return next(err);
    }
}

export async function addFile(req: Request, res: Response, next: NextFunction) {
    try {
        const { authId } = req.query;
        let { text, image } = req.body;

        text = String(text).trim();

        const fileId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO files (
                file_id,
                text,
                image_id,
                created_at,
                updated_at,
                updated_by,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
            [fileId, text, image.image_id, date, date, authId, authId]
        );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editFile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { fileId } = req.params;
        let { text, image } = req.body;

        text = String(text).trim();

        const date = new Date();

        await pool.query(
            `
            UPDATE files
            SET
                text=$1,
                image_id=$2,
                updated_at=$3,
                updated_by=$4
            WHERE file_id=$5
            `,
            [text, image.image_id, date, authId, fileId]
        );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteFile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { fileId } = req.params;

        await pool.query(`DELETE FROM files WHERE file_id=$1`, [fileId]);

        return res
            .status(200)
            .json({ messages: "You have successfully deleted a file." });
    } catch (err) {
        return next(err);
    }
}

import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const stripQuery = (
    filter: string,
    order: string,
    limit: string,
    offset: string
) => `
    SELECT
        s.strip_id,
        s.title,
        s.link,
        s.duration,
        s.type,
        s.created_at,
        s.updated_at,
        jsonb_build_object (
            'user_id', cb.user_id,
            'username', cb.username
        ) as created_by,
        jsonb_build_object (
            'user_id', ub.user_id,
            'username', ub.username
        ) as updated_by
    FROM strips s
        LEFT JOIN users cb ON cb.user_id=s.created_by
        LEFT JOIN users ub ON ub.user_id=s.updated_by
    ${filter || ""}
    GROUP BY s.strip_id, cb.user_id, ub.user_id
    ${order || "ORDER BY s.created_at desc"}
    ${limit || "LIMIT 100"}
    ${offset || ""}
`;

export async function getStrip(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { stripId } = req.params;

        const {
            rows: [strip],
        } = await pool.query(stripQuery("WHERE s.strip_id=$1", "", "", ""), [
            stripId,
        ]);

        return res.status(200).json(strip);
    } catch (err) {
        return next(err);
    }
}

export async function getStrips(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        try {
            const { rows: strips } = await pool.query(
                stripQuery("", "", "", "")
            );

            return res.status(200).json(strips);
        } catch (err) {
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
}

export async function addStrip(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let { title, link, duration, type } = req.body;

        title = String(title).trim();
        link = String(link).trim();
        type = String(type).trim();

        const stripId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO strips (
                strip_id,
                title,
                link,
                duration,
                type,
                created_at,
                updated_at,
                updated_by,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [stripId, title, link, duration, type, date, date, authId, authId]
        );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editStrip(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { stripId } = req.params;
        let { title, link, duration, type } = req.body;

        title = String(title).trim();
        link = String(link).trim();
        type = String(type).trim();

        const date = new Date();

        await pool.query(
            `
            UPDATE strips
            SET
                link=$1,
                duration=$2,
                type=$3,
                updated_at=$4,
                updated_by=$5,
                title=$6
            WHERE strip_id=$7
            `,
            [link, duration, type, date, authId, title, stripId]
        );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteStrip(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { stripId } = req.params;

        await pool.query(`DELETE FROM strips WHERE strip_id=$1`, [stripId]);

        return res
            .status(200)
            .json({ messages: "You have successfully deleted a strip." });
    } catch (err) {
        return next(err);
    }
}

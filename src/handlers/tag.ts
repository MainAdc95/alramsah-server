import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import { ITag } from "../models/tag";

const query = (filter?: string, order?: string, limit?: string) => `
            SELECT
                t.tag_id,
                t.tag_name,
                t.tag_order,
                t.created_at,
                t.updated_at,
                jsonb_build_object (
                    'user_id', cb.user_id,
                    'username', cb.username
                ) as created_by,
                jsonb_build_object (
                    'user_id', ub.user_id,
                    'username', ub.username
                ) as updated_by
            FROM tags t
                LEFT JOIN users cb ON cb.user_id=t.created_by
                LEFT JOIN users ub ON ub.user_id=t.updated_by
            ${filter || ""}
            GROUP BY t.tag_id, cb.user_id, ub.user_id
            ${order || "ORDER BY t.created_at desc"}
            ${limit || "LIMIT 100"}
        `;

export async function getTag(req: Request, res: Response, next: NextFunction) {
    try {
        const { tagId } = req.params;

        const {
            rows: [tag],
        }: QueryResult<ITag> = await pool.query(query("WHERE t.tag_id=$1"), [
            tagId,
        ]);

        return res.status(200).json(tag);
    } catch (err) {
        return next(err);
    }
}

export async function getTags(req: Request, res: Response, next: NextFunction) {
    try {
        const { p, r } = req.query;

        if (p || r) {
            const {
                rows: [{ count }],
            } = await pool.query(`SELECT count(*) FROM tags`);

            const { rows: tags }: QueryResult<ITag> = await pool.query(
                query(
                    p
                        ? `WHERE tag_order < ${
                              Number(Number(p) === 1 ? count + 1 : count) /
                              Number(p)
                          }`
                        : "",
                    "",
                    `LIMIT ${r}`
                )
            );

            return res.status(200).json({
                results: count,
                tags,
            });
        }

        const { rows: tags } = await pool.query(query());

        return res.status(200).json(tags);
    } catch (err) {
        return next(err);
    }
}

export async function addTag(req: Request, res: Response, next: NextFunction) {
    try {
        const { authId } = req.query;
        let { tag_name } = req.body;

        tag_name = String(tag_name).trim();

        const errors: any = {
            tag_name: [],
        };

        if (!tag_name) errors.tag_name.push("Please fill in tag name.");

        for (let v of Object.values(errors)) {
            if ((v as string[]).length)
                return next({
                    status: 400,
                    message: errors,
                });
        }

        const tagId = uuid();
        const date = new Date();

        // __________________________ add tag
        await pool.query(
            `
            INSERT INTO tags (
                tag_id,
                tag_name,
                created_at,
                updated_at,
                created_by,
                updated_by
            ) VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [tagId, tag_name, date, date, authId, authId]
        );

        const {
            rows: [tag],
        } = await pool.query(query("WHERE t.tag_id=$1", "", ""), [tagId]);

        return res.status(200).json(tag);
    } catch (err) {
        return next(err);
    }
}

export async function editTag(req: Request, res: Response, next: NextFunction) {
    try {
        const { authId } = req.query;
        const { tagId } = req.params;
        let { tag_name } = req.body;

        tag_name = String(tag_name).trim();

        const errors: any = {
            tag_name: [],
        };

        if (!tag_name) errors.tag_name.push("Please fill in tag name.");

        for (let v of Object.values(errors)) {
            if ((v as string[]).length)
                return next({
                    status: 400,
                    message: errors,
                });
        }

        const date = new Date();

        // __________________________ add tag
        await pool.query(
            `
            UPDATE tags
            SET
                tag_name=$1,
                updated_at=$2,
                updated_by=$3
            WHERE tag_id=$4
            `,
            [tag_name, date, authId, tagId]
        );

        return res
            .status(200)
            .json({ message: "You have successfully edit a tag." });
    } catch (err) {
        return next(err);
    }
}

export async function deleteTag(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { tagId } = req.params;

        await pool.query(`DELETE FROM tags WHERE tag_id=$1`, [tagId]);

        return res
            .status(200)
            .json({ message: "You have successfully deleted a tag." });
    } catch (err) {
        return next(err);
    }
}

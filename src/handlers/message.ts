import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import format from "pg-format";
import { IMessage } from "../models/message";
import { IImage } from "../models/image";

const messageQuery = (filter?: string, order?: string, limit?: string) => `
    SELECT
        m.message_id,
        m.subject,
        m.text,
        m.created_at,
        m.to_user,
        jsonb_build_object (
            'user_id', cb.user_id,
            'username', cb.username
        ) as created_by,
        CASE WHEN count(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END AS images
    FROM messages m
        LEFT JOIN users cb ON cb.user_id=m.created_by
        LEFT JOIN (
            SELECT
                mi.message_id,
                jsonb_build_object (
                    'image_id', i.image_id,
                    'sizes', i.sizes
                ) as image
            FROM message_image mi
                LEFT JOIN images i ON i.image_id=mi.image_id
        ) as i
            ON i.message_id=m.message_id
    ${filter || ""}
    GROUP BY m.message_id, cb.user_id
    ${order || "ORDER BY m.created_at desc"}
    ${limit || "LIMIT 100"}
`;

export async function getMessage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { messageId } = req.params;

        const {
            rows: [message],
        } = await pool.query(messageQuery("WHERE m.message_id=$1"), [
            messageId,
        ]);

        return res.status(200).json(message);
    } catch (err) {
        return next(err);
    }
}

export async function getMessages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { p, r, authId } = req.query;

        const {
            rows: [{ count }],
        } = await pool.query(
            `SELECT 
                COUNT(*) AS count
            FROM messages 
            WHERE to_user=$1
            `,
            [authId]
        );

        const { rows: messages }: QueryResult<IMessage> = await pool.query(
            messageQuery(
                p
                    ? `WHERE m.message_order < ${
                          Number(Number(p) === 1 ? count + 1 : count) /
                          Number(p)
                      } AND to_user=$1`
                    : `WHERE m.to_user=$1`,
                "",
                `LIMIT ${r}`
            ),
            [authId]
        );

        return res.status(200).json({ count, messages });
    } catch (err) {
        return next(err);
    }
}

export async function sendMessage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { subject, text, to, images } = req.body;

        const messageId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO messages (
                message_id,
                subject,
                text,
                to_user,
                created_by,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [messageId, subject, text, to, authId, date]
        );

        // ____________________________ images
        if (images.length)
            await pool.query(
                format(
                    `
            INSERT INTO message_image (
                message_id,
                image_id
            ) VALUES %L
            `,
                    images.map((img: IImage) => [messageId, img.image_id])
                )
            );

        return res
            .status(201)
            .json({ message: "You have successfully sent a message." });
    } catch (err) {
        return next(err);
    }
}

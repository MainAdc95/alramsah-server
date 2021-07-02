import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";

export async function getPrivacyPolicy(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: privacyPolicy } = await pool.query(
            `
            SELECT
                content
            FROM privacy_policy pp
            `
        );

        return res.status(200).json(privacyPolicy[0]);
    } catch (err) {
        return next(err);
    }
}

export async function editPrivacyPolicy(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { content } = req.body;

        const { rows: privacyPolicy } = await pool.query(
            `
            UPDATE privacy_policy
            SET
                content=$1,
                updated_at=$2,
                updated_by=$3
            RETURNING *
            `,
            [content, new Date(), authId]
        );

        return res.status(200).json(privacyPolicy[0]);
    } catch (err) {
        return next(err);
    }
}

import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const newsLetterQuery = (
    filter?: string,
    order?: string,
    limit?: string,
    offset?: string
) => `
    SELECT
        nl.news_letter_id,
        nl.email,
        nl.created_at
    FROM news_letter nl
    ${filter || ""}
    ${order || "ORDER BY created_at DESC"}
    ${limit || "LIMIT 100"}
    ${offset || ""}
`;

const sum = (times: number, value: number) => {
    let totalValue = 0;

    for (let i = 0; i < times; i++) {
        totalValue += value;
    }

    return totalValue - value;
};

export async function getNewsLetter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { p, r }: any = req.query;

        p = Number(p);
        r = Number(r);

        let {
            rows: [{ results }],
        } = await pool.query(`SELECT count(*) as results FROM news_letter`);

        results = Number(results);

        const { rows: newsLetter } = await pool.query(
            newsLetterQuery(
                "",
                "",
                r ? `LIMIT ${r}` : "",
                `OFFSET ${sum(p, r)}`
            )
        );

        return res.status(200).json({
            results,
            newsLetter,
        });
    } catch (err) {
        return next(err);
    }
}

export async function subscribeNewsLetter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { email } = req.body;

        email = String(email).trim().toLowerCase();

        const newsLetterId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO news_letter (
                news_letter_id,
                email,
                created_at
            ) VALUES ($1, $2, $3)
            `,
            [newsLetterId, email, date]
        );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteNewsLetter(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { newsLetterId } = req.params;

        await pool.query(`DELETE FROM news_letter WHERE news_letter_id=$1`, [
            newsLetterId,
        ]);

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

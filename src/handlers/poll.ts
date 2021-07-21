import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import format from "pg-format";
import { IPollOption } from "../models/poll";

const pollQuery = (filter?: string, order?: string) => `
    SELECT
        p.poll_id,
        p.title,
        p.is_active,
        p.created_at,
        p.updated_at,
        jsonb_build_object (
            'user_id', cb.user_id,
            'username', cb.username
        ) as created_by,
        jsonb_build_object (
            'user_id', ub.user_id,
            'username', ub.username
        ) as updated_by,
        CASE WHEN count(op)=0 THEN ARRAY[]::JSONB[] ELSE array_agg(
            jsonb_build_object (
                'option_id', op.option_id,
                'name', op.name,
                'votes', op.votes,
                'created_at', op.created_at
            )
        ) END AS options
    FROM polls p
        LEFT JOIN users cb ON cb.user_id=p.created_by
        LEFT JOIN users ub ON ub.user_id=p.updated_by
        LEFT JOIN poll_options op ON op.poll_id=p.poll_id
    ${filter || ""}    
    GROUP BY p.poll_id, cb.user_id, ub.user_id
    ${order || "ORDER BY p.created_at DESC"}    
`;

export async function getActivePoll(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const {
            rows: [poll],
        } = await pool.query(
            pollQuery(
                `
                WHERE p.is_active=true
                `
            )
        );

        return res.status(200).json(poll);
    } catch (err) {
        return next(err);
    }
}

export async function getPoll(req: Request, res: Response, next: NextFunction) {
    try {
        const { is_active } = req.query;
        const { pollId } = req.params;

        const {
            rows: [poll],
        } = await pool.query(
            pollQuery(
                `
                WHERE p.poll_id=$1 
                ${is_active ? `AND p.is_active=${is_active}` : ""}
                `
            ),
            [pollId]
        );

        return res.status(200).json(poll);
    } catch (err) {
        return next(err);
    }
}

export async function getPolls(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: polls } = await pool.query(pollQuery());

        return res.status(200).json(polls);
    } catch (err) {
        return next(err);
    }
}

export async function addPoll(req: Request, res: Response, next: NextFunction) {
    try {
        const { authId } = req.query;
        let { title, is_active, options } = req.body;

        title = String(title).trim();
        is_active = Boolean(is_active);

        // ______________________________ add poll
        const pollId = uuid();
        const date = new Date();

        await pool.query(
            `
                INSERT INTO polls (
                    poll_id,
                    title,
                    is_active,
                    created_by,
                    updated_by,
                    updated_at,
                    created_at
                ) VALUES ($1, $2,  $3, $4, $5, $6, $7)
                `,
            [pollId, title, is_active, authId, authId, date, date]
        );

        // ___________________________ options
        if (!options?.length) options = [{ name: "نعم" }, { name: "لا" }];

        await pool.query(
            format(
                `
                INSERT INTO poll_options (
                    option_id,
                    name,
                    votes,
                    poll_id,
                    created_at
                ) VALUES %L
                `,
                options.map((o: any) => [uuid(), o.name, 0, pollId, new Date()])
            )
        );

        // ____________________________________ disabled other active option
        if (is_active)
            await pool.query(
                `
            UPDATE polls
            SET
                is_active=false
            WHERE is_active=true AND poll_id != $1
            `,
                [pollId]
            );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editPoll(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { pollId } = req.params;
        let { title, is_active, options } = req.body;

        title = String(title).trim();
        is_active = Boolean(is_active);

        // ______________________________ add poll
        const date = new Date();

        await pool.query(
            `
                UPDATE polls
                SET
                    title=$1,
                    updated_by=$2,
                    updated_at=$3,
                    is_active=$4
                WHERE poll_id=$5
                `,
            [title, authId, date, is_active, pollId]
        );

        // ___________________________ options
        const { rows: oldOptions }: QueryResult<IPollOption> = await pool.query(
            `
            SELECT
                po.option_id,
                po.name
            FROM poll_options po
            WHERE po.poll_id=$1
            `,
            [pollId]
        );

        if (options?.length) {
            const delOptions: any = [];
            const addOptions: any = [];

            // add / delete logic
            for (let option of options) {
                const foundOption = oldOptions.find(
                    (i) => i.option_id === option.option_id
                );

                if (!foundOption)
                    addOptions.push([
                        uuid(),
                        option.name,
                        0,
                        pollId,
                        new Date(),
                    ]);
            }

            for (let option of oldOptions) {
                const foundOption = options.find(
                    (i: IPollOption) => i.option_id === option.option_id
                );

                if (!foundOption) delOptions.push([option.option_id]);
            }

            // add
            if (addOptions.length)
                await pool.query(
                    format(
                        `
                        INSERT INTO poll_options (
                            option_id,
                            name,
                            votes,
                            poll_id,
                            created_at
                        ) VALUES %L
                        `,
                        addOptions
                    )
                );

            // delete
            if (delOptions.length)
                await pool.query(
                    format(
                        `
                        DELETE FROM poll_options WHERE option_id IN (%L)
                        `,
                        delOptions
                    )
                );
        }

        // ____________________________________ disabled other active option
        if (is_active)
            await pool.query(
                `
            UPDATE polls
            SET
                is_active=false
            WHERE is_active=true AND poll_id != $1
            `,
                [pollId]
            );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deletePoll(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { pollId } = req.params;

        await pool.query(`DELETE FROM polls WHERE poll_id=$1`, [pollId]);

        return res
            .status(200)
            .json({ message: "You have successfully deleted a poll." });
    } catch (err) {
        return next(err);
    }
}

export async function vote(req: Request, res: Response, next: NextFunction) {
    try {
        const { optionId } = req.params;

        await pool.query(
            `UPDATE poll_options SET votes = votes + 8 WHERE option_id=$1`,
            [optionId]
        );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import { ISection } from "../models/section";

const query = (filter: string, order: string) => `
            SELECT
                s.section_id,
                s.section_name,
                s.color,
                s.updated_at,
                s.created_at,
                s.section_order,
                jsonb_build_object (
                    'user_id', cb.user_id,
                    'username', cb.username
                ) as created_by,
                jsonb_build_object (
                    'user_id', ub.user_id,
                    'username', ub.username
                ) as updated_by
            FROM sections s
                LEFT JOIN users cb ON cb.user_id=s.created_by
                LEFT JOIN users ub ON ub.user_id=s.updated_by
            ${filter}
            GROUP BY s.section_id, cb.user_id, ub.user_id
            ${order}
        `;

export async function getSection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { sectionId } = req.params;

        const {
            rows: [section],
        }: QueryResult<ISection> = await pool.query(
            query("WHERE s.section_id=$1", ""),
            [sectionId]
        );

        return res.status(200).json(section);
    } catch (err) {
        return next(err);
    }
}

export async function getSections(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: sections }: QueryResult<ISection> = await pool.query(
            query("", "")
        );

        return res.status(200).json(sections);
    } catch (err) {
        return next(err);
    }
}

export async function addSection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let { section_name, color } = req.body;

        section_name = String(section_name).trim();
        color = String(color).trim();

        const sectionId = uuid();
        const date = new Date();

        // ______________________________ add sections
        await pool.query(
            `
            INSERT INTO sections (
                section_id,
                color,
                section_name,
                created_by,
                updated_by,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
            [sectionId, color, section_name, authId, authId, date, date]
        );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editSection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { sectionId } = req.params;
        let { section_name, color } = req.body;

        section_name = String(section_name).trim();
        color = String(color).trim();

        const date = new Date();

        // ______________________________ add sections
        await pool.query(
            `
            UPDATE sections
            SET
                color=$1,
                section_name=$2,
                updated_by=$3,
                updated_at=$4
            WHERE section_id=$5
        `,
            [color, section_name, authId, date, sectionId]
        );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteSection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { sectionId } = req.params;

        await pool.query(`DELETE FROM sections WHERE section_id=$1`, [
            sectionId,
        ]);

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

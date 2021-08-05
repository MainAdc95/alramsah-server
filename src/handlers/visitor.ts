import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import geoip from "geoip-lite";
import { v4 as uuid } from "uuid";

export async function addVisitor(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        //92.99.115.26" ||
        let userData: any = geoip.lookup(req.ip);

        if (!userData)
            return next({ status: 500, message: "Invalid ip address." });

        userData = { ...userData, ip: req.ip, browser: req.get("user-agent") };

        const visitorId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO visitors (
                visitor_id,
                user_data,
                created_at
            ) values ($1, $2, $3)
            `,
            [visitorId, userData, date]
        );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function getVisitors(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: visitors } = await pool.query(
            `
            SELECT
                visitor_id,
                ip,
                city,
                country,
                created_at,
                browser
            FROM visitors
            `
        );

        return res.status(200).json(visitors);
    } catch (err) {
        return next(err);
    }
}

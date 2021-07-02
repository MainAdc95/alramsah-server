import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Config from "../config";
import { IUser } from "../models/user";
import { setAuthCookies } from "../utils/authCookies";
import { QueryResult } from "pg";

export const isLoggedIn = function (
    req: { modifedUser?: IUser; decoded?: any } & Request,
    res: Response,
    next: NextFunction
) {
    let token: string | null = null;

    if (req.cookies) token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });

    jwt.verify(token, Config.jwtSecret!, async (err: any, decoded: any) => {
        try {
            if (err) return next(err);

            const { authId } = req.query;

            if (decoded.user_id === authId) {
                const {
                    rows: [user],
                }: QueryResult<IUser> = await pool.query(
                    `
                    SELECT
                        user_id,
                        version,
                        is_active,
                        is_blocked,
                        is_admin,
                        is_super_admin,
                        is_editor,
                        is_reporter
                    FROM users 
                    WHERE user_id=$1
                    `,
                    [authId]
                );

                if (!user.is_active)
                    return next({
                        status: 400,
                        message: "Please activate your account first.",
                    });

                if (user.is_blocked)
                    return next({
                        status: 400,
                        message:
                            "Your account has been blocked please contact us to know why, thank you.",
                    });

                const {
                    user_id,
                    version,
                    is_admin,
                    is_super_admin,
                    is_editor,
                    is_reporter,
                } = user;

                if (version !== decoded.version) {
                    setAuthCookies(res, {
                        version,
                        is_admin,
                        is_super_admin,
                        user_id,
                        is_editor,
                        is_reporter,
                    });

                    req.modifedUser = user;
                }

                req.decoded = decoded;
                return next();
            }

            return next({
                status: 401,
                message: "unauthorized.",
            });
        } catch (err) {
            return next(err);
        }
    });
};

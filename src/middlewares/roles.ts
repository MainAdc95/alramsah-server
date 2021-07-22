import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user";

export const isAdmin = function (
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

    if (req.modifedUser) {
        if (req.modifedUser.is_admin || req.modifedUser.is_super_admin)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }

    const { decoded } = req;

    if (decoded) {
        if (decoded.is_super_admin || decoded.is_admin) return next();

        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};

export const isEditor = function (
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

    if (req.modifedUser) {
        if (
            req.modifedUser.is_admin ||
            req.modifedUser.is_super_admin ||
            req.modifedUser.is_editor
        )
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }

    const { decoded } = req;

    if (decoded) {
        if (decoded.is_super_admin || decoded.is_admin || decoded.is_editor)
            return next();

        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};

export const isSuperAdmin = function (
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

    let user: IUser | undefined = req.modifedUser;

    if (user) {
        if (user.is_super_admin) return next();

        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }

    user = req.decoded;

    if (user) {
        if (user.is_super_admin) return next();

        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};

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

type Role =
    | "all"
    | "is_super_admin"
    | "is_admin"
    | "is_editor"
    | "is_reporter"
    | "is_writer"
    | "is_admin_assistant";

const allRoles: Role[] = [
    "all",
    "is_super_admin",
    "is_admin",
    "is_editor",
    "is_reporter",
    "is_writer",
    "is_admin_assistant",
];

const isRole = (user: IUser, role: Role) => {
    switch (role) {
        case "all":
            if (
                user.is_super_admin ||
                user.is_admin ||
                user.is_admin_assistant ||
                user.is_editor ||
                user.is_reporter ||
                user.is_writer
            )
                return true;

            return false;
        case "is_super_admin":
            if (user.is_super_admin) return true;

            return false;
        case "is_admin":
            if (user.is_admin) return true;

            return false;
        case "is_editor":
            if (user.is_editor) return true;

            return false;
        case "is_reporter":
            if (user.is_reporter) return true;

            return false;
        case "is_writer":
            if (user.is_writer) return true;

            return false;
        case "is_admin_assistant":
            if (user.is_admin_assistant) return true;

            return false;
        default:
            false;
    }
};

const isEligible = (roles: Role[], user: IUser) => {
    for (let r of roles) {
        if (isRole(user, r)) return true;
    }

    return false;
};

export const checkRole = function (
    req: { modifedUser?: IUser; decoded?: any } & Request,
    next: NextFunction,
    roles: Role[]
) {
    let token: string | null = null;

    if (req.cookies) token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });

    if (req.modifedUser) {
        if (isEligible(roles, req.modifedUser)) return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }

    const { decoded } = req;

    if (decoded) {
        if (isEligible(roles, decoded)) return next();

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

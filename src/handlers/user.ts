import { Request, Response, NextFunction } from "express";
import validate from "../utils/validators";
import { pool } from "../utils/db";
import { QueryResult } from "pg";
import { IUser } from "../models/user";

interface IError {
    avatar: string[];
    first_name: string[];
    last_name: string[];
    phone: string[];
}

const userQuery = (
    filter?: string,
    order?: string,
    limit?: string,
    offset?: string
) => `
            SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.username,
                u.email,
                u.phone,
                u.is_editor,
                u.is_reporter,
                u.is_admin,
                u.is_admin_assistant,
                u.is_writer,
                u.is_super_admin,
                u.is_active,
                u.is_blocked,
                u.created_at,
                u.updated_at,
                jsonb_build_object (
                    'image_id', ui.image_id,
                    'sizes', ui.sizes
                ) as avatar
            FROM users u
                LEFT JOIN users uu ON u.user_id=uu.user_id
                LEFT JOIN users cu ON u.user_id=cu.user_id
                LEFT JOIN user_images ui ON ui.image_id=u.avatar
            ${filter}
            GROUP BY u.user_id, ui.image_id
            ${order || "ORDER BY u.created_at desc"}
            ${limit || ""}
            ${offset || ""}
        `;

const sum = (times: number, value: number) => {
    let totalValue = 0;

    for (let i = 0; i < times; i++) {
        totalValue += value;
    }

    return totalValue - value;
};

export async function getUsers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { authId, p, r }: any = req.query;

        p = Number(p);
        r = r ? Number(r) : 20;

        let {
            rows: [{ results }],
        } = await pool.query(
            `
            SELECT 
                count(*) as results 
            FROM users
            WHERE user_id != $1
            `,
            [authId]
        );

        results = Number(results);

        const { rows: users }: QueryResult<IUser> = await pool.query(
            userQuery(
                "WHERE u.user_id != $1",
                "",
                r ? `LIMIT ${r}` : "",
                `OFFSET ${sum(p, r)}`
            ),
            [authId]
        );

        return res.status(200).json({
            results,
            users,
        });
    } catch (err) {
        return next(err);
    }
}

export async function manageUserRole(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { userId } = req.params;
        let { admin } = req.query;

        if (!admin)
            return next({
                status: 400,
                message: "Please supply admin status.",
            });

        const isAdmin: boolean = admin === "true";

        await pool.query(
            `
            UPDATE users
            SET
                version=version + 1,
                is_admin=$1
            WHERE user_id=$2
            `,
            [isAdmin, userId]
        );

        return res.status(200).json({
            message: `You have successfully ${
                isAdmin ? "removed an admin" : "added an admin"
            }.`,
        });
    } catch (err) {
        return next(err);
    }
}

export async function editProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let { avatar, first_name, last_name, phone } = req.body;

        // data manipulation
        first_name = String(first_name?.trim());
        last_name = String(last_name?.trim());
        phone = String(phone?.trim());

        const errors: IError = {
            avatar: [],
            first_name: [],
            last_name: [],
            phone: [],
        };

        if (first_name) {
            if (validate.maxLength(first_name, 20))
                errors.first_name.push(
                    "Please enter your first name and it must be less than 20 characters."
                );
        } else errors.first_name.push("Please enter your first name.");

        if (last_name) {
            if (validate.maxLength(last_name, 20))
                errors.last_name.push(
                    "Please enter your last name and it must be less than 20 characters."
                );
        } else errors.last_name.push("Please enter your last name.");

        if (phone) {
            if (validate.range(phone, 10, 10))
                errors.phone.push(
                    "Please enter your phone number and it must be 10 characters."
                );
        } else errors.phone.push("Please enter your phone number.");

        // _____ check for errors _______

        for (let v of Object.values(errors)) {
            if (v.length)
                return next({
                    status: 400,
                    message: errors,
                });
        }
        // validation ______________ END

        await pool.query(
            `
            UPDATE users
            SET
                avatar=$1,
                first_name=$2,
                last_name=$3,
                phone=$4
            WHERE user_id=$5
            `,
            [avatar, first_name, last_name, phone, authId]
        );

        const { rows: user } = await pool.query(
            `
            SELECT 
            first_name,
            last_name,
            phone,
                json_build_object (
                    'image_id', ui.image_id
                ) as avatar
            FROM users u
                LEFT JOIN user_images ui ON u.avatar=ui.image_id
            WHERE u.user_id=$1
            `,
            [authId]
        );

        return res.status(200).json(user[0]);
    } catch (err) {
        return next(err);
    }
}

export async function editRole(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { userId } = req.params;
        const {
            is_writer,
            is_admin_assistant,
            is_reporter,
            is_editor,
            is_blocked,
            is_active,
        } = req.body;

        const date = new Date();

        await pool.query(
            `
            UPDATE users
            SET
                version=version + 1,
                is_editor=$1,
                is_reporter=$2,
                is_writer=$3,
                is_admin_assistant=$4,
                is_blocked=$5,
                is_active=$6,
                updated_at=$7,
                updated_by=$8
            WHERE user_id=$9
            `,
            [
                is_editor,
                is_reporter,
                is_writer,
                is_admin_assistant,
                is_blocked,
                is_active,
                date,
                authId,
                userId,
            ]
        );

        return res
            .status(200)
            .json({ message: "You have successfully updated a user." });
    } catch (err) {
        return next(err);
    }
}

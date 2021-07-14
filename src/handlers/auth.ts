import { Request, Response, NextFunction } from "express";
import { QueryResult } from "pg";
import valid from "../utils/validators";
import bcrypt from "bcrypt";
import { pool } from "../utils/db";
import { setAuthCookies, removeAuthCookies } from "../utils/authCookies";
import { IUser } from "../models/user";
import jwt from "jsonwebtoken";
import Config from "../config";
import { v4 as uuid } from "uuid";
import { sendSyncEmail } from "../utils/email";

const userQuery = (filter?: string) => `    
    SELECT
        u.user_id,
        jsonb_build_object (
            'image_id', ui.image_id,
            'image_id', ui.image_id
        ) as avatar,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.password,
        u.version,
        u.is_admin,
        u.is_active,
        u.is_blocked,
        u.is_super_admin,
        u.is_editor,
        u.is_reporter
    FROM users u
        LEFT JOIN user_images ui ON u.avatar=ui.image_id
    ${filter || ""}
`;

export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        let {
            username,
            first_name,
            last_name,
            email,
            phone,
            password,
            password2,
        } = req.body;

        // data manipulation
        username = username?.trim();
        first_name = first_name?.trim();
        last_name = last_name?.trim();
        email = email?.trim().toLowerCase();
        phone = phone?.trim();
        password = password?.trim();
        password2 = password2?.trim();

        interface IError {
            username: string[];
            first_name: string[];
            last_name: string[];
            email: string[];
            phone: string[];
            password: string[];
            password2: string[];
        }

        const errors: IError = {
            username: [],
            first_name: [],
            last_name: [],
            email: [],
            phone: [],
            password: [],
            password2: [],
        };

        // validation ______________ START
        if (username) {
            if (valid.range(username, 3, 20))
                errors.username.push(
                    "Please enter a username between 3 and 20 characters."
                );
            else {
                const foundUsername = await pool.query(
                    `SELECT username FROM users WHERE username=$1`,
                    [username]
                );
                if (foundUsername.rowCount)
                    errors.username.push(
                        "This username already exists in our system."
                    );
            }
        } else errors.username.push("Please enter a username.");

        if (first_name) {
            if (valid.maxLength(first_name, 20))
                errors.first_name.push(
                    "Please enter your first name and it must be less than 20 characters."
                );
        } else errors.first_name.push("Please enter your first name.");

        if (last_name) {
            if (valid.maxLength(last_name, 20))
                errors.last_name.push(
                    "Please enter your last name and it must be less than 20 characters."
                );
        } else errors.last_name.push("Please enter your last name.");

        if (phone) {
            if (valid.range(phone, 10, 10))
                errors.phone.push(
                    "Please enter your phone number and it must be 10 characters."
                );
        } else errors.phone.push("Please enter your phone number.");

        if (email) {
            if (valid.isEmail(email))
                errors.email.push("Please enter a valid email address.");
            else {
                const foundEmail = await pool.query(
                    `SELECT username FROM users WHERE email=$1`,
                    [email]
                );
                if (foundEmail.rowCount)
                    errors.email.push(
                        "This email address already exists in our system."
                    );
            }
        } else errors.email.push("Please enter your email address.");

        if (password) {
            if (valid.minLength(password, 8))
                errors.password.push(
                    "Please enter a password that is at least 8 characters."
                );
        } else errors.password.push("Please enter a password.");

        if (password2) {
            if (password !== password2)
                errors.password2.push("Those passwords didn't match.");
        } else errors.password2.push("Please repeat your password.");

        // _____ check for errors _______

        for (let v of Object.values(errors)) {
            if (v.length)
                return next({
                    status: 400,
                    message: errors,
                });
        }
        // validation ______________ END

        // hashing the password to be stored in the data base.
        const hashPassword = await bcrypt.hash(password, 10);

        let userId = uuid();

        // creating a user in the data base
        await pool.query(
            `INSERT INTO users (
                user_id,
                avatar,
                username,
                first_name,
                last_name,
                email,
                phone,
                password,
                version
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            `,
            [
                userId,
                "2d06f735-f13c-4142-803b-6834648fed2d",
                username,
                first_name,
                last_name,
                email,
                phone,
                hashPassword,
                1,
            ]
        );

        const accountActivationToken = jwt.sign({ userId }, Config.jwtSecret, {
            expiresIn: "10m",
        });

        const activationLink = `${Config.domain}/auth/activate_account/${accountActivationToken}`;

        const html = `
            <h1>Account activation</h1>
            <p style="font-size: 20px;">Click this <a href="${activationLink}">link</a> to active your account.</p>
        `;

        sendSyncEmail("noreply", "Account activation - Alramsah", html, email);

        const {
            rows: [user],
        }: QueryResult<IUser> = await pool.query(
            userQuery(`WHERE u.user_id=$1`),
            [userId]
        );

        // user detials to be stored in the token
        const { user_id } = user;

        return res.status(201).json({
            user_id,
        });
    } catch (err) {
        return next(err);
    }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
    try {
        let { identifier, password } = req.body;

        // data manipulation
        identifier = String(identifier).trim();
        password = String(password).trim();

        // validating data
        if (!identifier || !password)
            return next({
                status: 400,
                message: "Please fill in all the empty blanks.",
            });

        var {
            rows: [user],
        }: QueryResult<IUser> = await pool.query(
            userQuery(`WHERE u.email=$1`),
            [identifier]
        );

        if (!user) {
            var {
                rows: [user],
            }: QueryResult<IUser> = await pool.query(
                userQuery(`WHERE u.username=$1`),
                [identifier]
            );
        }

        if (!user)
            return next({
                status: 401,
                message:
                    "Your login credentials don't match an account in our system.",
            });

        // comparing the password with the user password in db.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return next({
                status: 401,
                message:
                    "Your login credentials don't match an account in our system.",
            });

        // check if the user can signin
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

        // user detials to be stored in the token
        const {
            user_id,
            version,
            is_admin,
            is_super_admin,
            is_editor,
            is_reporter,
        } = user;

        // generating a jsonwebtoken for authentication and saving them in the cookies
        setAuthCookies(res, {
            version,
            is_admin,
            is_super_admin,
            user_id,
            is_editor,
            is_reporter,
        });

        return res.status(200).json({
            user_id,
            avatar: user.avatar,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            version: version,
            is_admin: is_admin,
            is_super_admin: is_super_admin,
            is_editor,
            is_reporter,
        });
    } catch (err) {
        return next(err);
    }
}

export async function signinOnload(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let token: string | null = null;

    if (req.cookies) token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "Please login first.",
        });

    jwt.verify(token, Config.jwtSecret!, async (err: any, decoded: any) => {
        try {
            if (err) return next(err);

            if (decoded) {
                var {
                    rows: [user],
                }: QueryResult<IUser> = await pool.query(
                    userQuery(`WHERE u.user_id=$1`),
                    [decoded.user_id]
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
                    username,
                    first_name,
                    last_name,
                    email,
                    phone,
                    user_id,
                    avatar,
                    version,
                    is_admin,
                    is_super_admin,
                    is_editor,
                    is_reporter,
                } = user;

                if (decoded.user_id !== req.params.id) {
                    // user detials

                    if (version !== decoded.version) {
                        // generating a jsonwebtoken for authentication and saving them in the cookies
                        setAuthCookies(res, {
                            version,
                            is_admin,
                            is_super_admin,
                            user_id,
                            is_editor,
                            is_reporter,
                        });
                    }
                }

                return res.status(200).json({
                    user_id,
                    username: username,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    phone: phone,
                    version: version,
                    avatar,
                    is_admin: is_admin,
                    is_super_admin: is_super_admin,
                    is_editor,
                    is_reporter,
                });
            }
        } catch (err) {
            return next(err);
        }
    });
}

export async function signout(req: Request, res: Response, next: NextFunction) {
    try {
        // remove auth cookies = sign out user
        removeAuthCookies(res);

        return res.status(200).json({ message: "You signed out." });
    } catch (err) {
        return next(err);
    }
}

export async function activateAccount(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { token } = req.params;

        jwt.verify(token, Config.jwtSecret, async (err: any, decoded: any) => {
            if (err)
                return res.status(410).send(`<h1>This link is expired.</h1>`);

            try {
                await pool.query(
                    `
                    UPDATE users
                    SET
                        is_active=true
                    WHERE user_id=$1
                `,
                    [decoded.userId]
                );

                res.redirect(`${Config.clientDomain}/signin`);
            } catch (err) {
                return next(err);
            }
        });
    } catch (err) {
        return next(err);
    }
}

export async function resendEmail(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { userId } = req.params;

        const {
            rows: [user],
        }: QueryResult<IUser> = await pool.query(
            userQuery(`WHERE u.user_id=$1`),
            [userId]
        );

        if (!user)
            return next({
                status: 400,
                message: `There is no account in our system with this id ${userId}.`,
            });

        const { email } = user;

        const accountActivationToken = jwt.sign({ userId }, Config.jwtSecret, {
            expiresIn: "10m",
        });

        const activationLink = `${Config.domain}/auth/activate_account/${accountActivationToken}`;

        const html = `
            <h1>Account activation</h1>
            <p style="font-size: 20px;">Click this <a href="${activationLink}">link</a> to active your account.</p>
        `;

        sendSyncEmail("noreply", "Account activation - Alramsah", html, email);

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

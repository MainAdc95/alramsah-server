import jwt from "jsonwebtoken";
import Config from "../config";
import { Response } from "express";

interface IJwt {
    version: number;
    is_admin: boolean;
    is_super_admin: boolean;
    user_id: string;
    is_editor: boolean;
    is_admin_assistant: boolean;
    is_writer: boolean;
    is_reporter: boolean;
}

export const setAuthCookies = (res: Response, data: IJwt) => {
    if (Config.jwtSecret) {
        let token: string = jwt.sign(data, Config.jwtSecret);

        if (!Config.isProduction) {
            res.cookie("jwt", token, {
                httpOnly: true,
                expires: new Date(9999, 99, 9),
            });
        } else if (Config.isProduction) {
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                expires: new Date(9999, 99, 9),
            });
        }

        res.cookie("isAuth", true, { expires: new Date(9999, 99, 9) });
    }
};

export const removeAuthCookies = (res: Response) => {
    if (Config.jwtSecret) {
        if (!Config.isProduction) {
            res.cookie("jwt", "", {
                httpOnly: true,
                expires: new Date(9999, 99, 9),
            });
        } else if (Config.isProduction) {
            res.cookie("jwt", "", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                expires: new Date(9999, 99, 9),
            });
        }

        res.cookie("isAuth", false, { expires: new Date(9999, 99, 9) });
    }
};

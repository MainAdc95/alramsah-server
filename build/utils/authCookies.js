"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAuthCookies = exports.setAuthCookies = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var config_1 = __importDefault(require("../config"));
var setAuthCookies = function (res, data) {
    if (config_1.default.jwtSecret) {
        var token = jsonwebtoken_1.default.sign(data, config_1.default.jwtSecret);
        if (!config_1.default.isProduction) {
            res.cookie("jwt", token, {
                httpOnly: true,
                expires: new Date(9999, 99, 9),
            });
        }
        else if (config_1.default.isProduction) {
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
exports.setAuthCookies = setAuthCookies;
var removeAuthCookies = function (res) {
    if (config_1.default.jwtSecret) {
        if (!config_1.default.isProduction) {
            res.cookie("jwt", "", {
                httpOnly: true,
                expires: new Date(9999, 99, 9),
            });
        }
        else if (config_1.default.isProduction) {
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
exports.removeAuthCookies = removeAuthCookies;

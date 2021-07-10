"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isAdmin = void 0;
var isAdmin = function (req, res, next) {
    var token = null;
    if (req.cookies)
        token = req.cookies.jwt;
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
    var decoded = req.decoded;
    if (decoded) {
        if (decoded.is_super_admin || decoded.is_admin)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};
exports.isAdmin = isAdmin;
var isSuperAdmin = function (req, res, next) {
    var token = null;
    if (req.cookies)
        token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });
    var user = req.modifedUser;
    if (user) {
        if (user.is_super_admin)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
    user = req.decoded;
    if (user) {
        if (user.is_super_admin)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};
exports.isSuperAdmin = isSuperAdmin;

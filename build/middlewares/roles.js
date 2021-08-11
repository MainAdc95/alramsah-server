"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = exports.isEditor = exports.checkRole = exports.isAdmin = void 0;
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
var allRoles = [
    "all",
    "is_super_admin",
    "is_admin",
    "is_editor",
    "is_reporter",
    "is_writer",
    "is_admin_assistant",
];
var isRole = function (user, role) {
    switch (role) {
        case "all":
            if (user.is_super_admin ||
                user.is_admin ||
                user.is_admin_assistant ||
                user.is_editor ||
                user.is_reporter ||
                user.is_writer)
                return true;
            return false;
        case "is_super_admin":
            if (user.is_super_admin)
                return true;
            return false;
        case "is_admin":
            if (user.is_admin)
                return true;
            return false;
        case "is_editor":
            if (user.is_editor)
                return true;
            return false;
        case "is_reporter":
            if (user.is_reporter)
                return true;
            return false;
        case "is_writer":
            if (user.is_writer)
                return true;
            return false;
        case "is_admin_assistant":
            if (user.is_admin_assistant)
                return true;
            return false;
        default:
            false;
    }
};
var isEligible = function (roles, user) {
    for (var _i = 0, roles_1 = roles; _i < roles_1.length; _i++) {
        var r = roles_1[_i];
        if (isRole(user, r))
            return true;
    }
    return false;
};
var checkRole = function (req, next, roles) {
    var token = null;
    if (req.cookies)
        token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });
    if (req.modifedUser) {
        if (isEligible(roles, req.modifedUser))
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
    var decoded = req.decoded;
    if (decoded) {
        if (isEligible(roles, decoded))
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};
exports.checkRole = checkRole;
var isEditor = function (req, res, next) {
    var token = null;
    if (req.cookies)
        token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });
    if (req.modifedUser) {
        if (req.modifedUser.is_admin ||
            req.modifedUser.is_super_admin ||
            req.modifedUser.is_editor)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
    var decoded = req.decoded;
    if (decoded) {
        if (decoded.is_super_admin || decoded.is_admin || decoded.is_editor)
            return next();
        return next({
            status: 401,
            message: "Unauthorized.",
        });
    }
};
exports.isEditor = isEditor;
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

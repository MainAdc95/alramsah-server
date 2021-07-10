"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editRole = exports.editProfile = exports.manageUserRole = exports.getUsers = void 0;
var validators_1 = __importDefault(require("../utils/validators"));
var db_1 = require("../utils/db");
var userQuery = function (filter, order, limit) { return "\n            SELECT\n                u.user_id,\n                u.first_name,\n                u.last_name,\n                u.username,\n                u.email,\n                u.phone,\n                u.is_editor,\n                u.is_reporter,\n                u.is_admin,\n                u.is_super_admin,\n                u.is_active,\n                u.is_blocked,\n                u.created_at,\n                u.updated_at,\n                jsonb_build_object (\n                    'image_id', ui.image_id,\n                    'image_id', ui.image_id\n                ) as avatar\n            FROM users u\n                LEFT JOIN users uu ON u.user_id=uu.user_id\n                LEFT JOIN users cu ON u.user_id=cu.user_id\n                LEFT JOIN user_images ui ON ui.image_id=u.avatar\n            " + filter + "\n            GROUP BY u.user_id, ui.image_id\n            " + (order || "ORDER BY u.created_at desc") + "\n            " + (limit || "LIMIT 100") + "\n        "; };
function getUsers(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, authId, p, r, count, users_1, users, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.query, authId = _a.authId, p = _a.p, r = _a.r;
                    if (!(p || r)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.pool.query("SELECT count(*) FROM users")];
                case 1:
                    count = (_b.sent()).rows[0].count;
                    return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.user_id != $1 AND u.is_super_admin != true AND u.user_order < " + Number(Number(p) === 1 ? count + 1 : count) / Number(p), "", r ? "LIMIT " + r : ""), [authId])];
                case 2:
                    users_1 = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({
                            results: count,
                            users: users_1,
                        })];
                case 3: return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.user_id != $1 AND u.is_super_admin != true"), [authId])];
                case 4:
                    users = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json(users)];
                case 5:
                    err_1 = _b.sent();
                    return [2 /*return*/, next(err_1)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.getUsers = getUsers;
function manageUserRole(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, admin, isAdmin, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.params.userId;
                    admin = req.query.admin;
                    if (!admin)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "Please supply admin status.",
                            })];
                    isAdmin = admin === "true";
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE users\n            SET\n                version=version + 1,\n                is_admin=$1\n            WHERE user_id=$2\n            ", [isAdmin, userId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json({
                            message: "You have successfully " + (isAdmin ? "removed an admin" : "added an admin") + ".",
                        })];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, next(err_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.manageUserRole = manageUserRole;
function editProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, avatar, first_name, last_name, phone, errors, _i, _b, v, user, err_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    authId = req.query.authId;
                    _a = req.body, avatar = _a.avatar, first_name = _a.first_name, last_name = _a.last_name, phone = _a.phone;
                    // data manipulation
                    first_name = String(first_name === null || first_name === void 0 ? void 0 : first_name.trim());
                    last_name = String(last_name === null || last_name === void 0 ? void 0 : last_name.trim());
                    phone = String(phone === null || phone === void 0 ? void 0 : phone.trim());
                    errors = {
                        avatar: [],
                        first_name: [],
                        last_name: [],
                        phone: [],
                    };
                    if (first_name) {
                        if (validators_1.default.maxLength(first_name, 20))
                            errors.first_name.push("Please enter your first name and it must be less than 20 characters.");
                    }
                    else
                        errors.first_name.push("Please enter your first name.");
                    if (last_name) {
                        if (validators_1.default.maxLength(last_name, 20))
                            errors.last_name.push("Please enter your last name and it must be less than 20 characters.");
                    }
                    else
                        errors.last_name.push("Please enter your last name.");
                    if (phone) {
                        if (validators_1.default.range(phone, 10, 10))
                            errors.phone.push("Please enter your phone number and it must be 10 characters.");
                    }
                    else
                        errors.phone.push("Please enter your phone number.");
                    // _____ check for errors _______
                    for (_i = 0, _b = Object.values(errors); _i < _b.length; _i++) {
                        v = _b[_i];
                        if (v.length)
                            return [2 /*return*/, next({
                                    status: 400,
                                    message: errors,
                                })];
                    }
                    // validation ______________ END
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE users\n            SET\n                avatar=$1,\n                first_name=$2,\n                last_name=$3,\n                phone=$4\n            WHERE user_id=$5\n            ", [avatar, first_name, last_name, phone, authId])];
                case 1:
                    // validation ______________ END
                    _c.sent();
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT \n            first_name,\n            last_name,\n            phone,\n                json_build_object (\n                    'image_id', ui.image_id\n                ) as avatar\n            FROM users u\n                LEFT JOIN user_images ui ON u.avatar=ui.image_id\n            WHERE u.user_id=$1\n            ", [authId])];
                case 2:
                    user = (_c.sent()).rows;
                    return [2 /*return*/, res.status(200).json(user[0])];
                case 3:
                    err_3 = _c.sent();
                    return [2 /*return*/, next(err_3)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.editProfile = editProfile;
function editRole(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, userId, _a, is_reporter, is_editor, is_blocked, is_active, date, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    userId = req.params.userId;
                    _a = req.body, is_reporter = _a.is_reporter, is_editor = _a.is_editor, is_blocked = _a.is_blocked, is_active = _a.is_active;
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE users\n            SET\n                version=version + 1,\n                is_editor=$1,\n                is_reporter=$2,\n                is_blocked=$3,\n                is_active=$4,\n                updated_at=$5,\n                updated_by=$6\n            WHERE user_id=$7\n            ", [
                            is_reporter,
                            is_editor,
                            is_blocked,
                            is_active,
                            date,
                            authId,
                            userId,
                        ])];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully updated a user." })];
                case 2:
                    err_4 = _b.sent();
                    return [2 /*return*/, next(err_4)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.editRole = editRole;

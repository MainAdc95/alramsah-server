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
exports.isLoggedIn = void 0;
var db_1 = require("../utils/db");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var config_1 = __importDefault(require("../config"));
var authCookies_1 = require("../utils/authCookies");
var isLoggedIn = function (req, res, next) {
    var _this = this;
    var token = null;
    if (req.cookies)
        token = req.cookies.jwt;
    if (!token)
        return next({
            status: 401,
            message: "please login first.",
        });
    jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret, function (err, decoded) { return __awaiter(_this, void 0, void 0, function () {
        var authId, user, user_id, version, is_admin, is_super_admin, is_admin_assistant, is_writer, is_editor, is_reporter, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (err)
                        return [2 /*return*/, next(err)];
                    authId = req.query.authId;
                    if (!(decoded.user_id === authId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, db_1.pool.query("\n                    SELECT\n                        user_id,\n                        version,\n                        is_active,\n                        is_blocked,\n                        is_admin,\n                        is_super_admin,\n                        is_admin_assistant,\n                        is_writer,\n                        is_editor,\n                        is_reporter\n                    FROM users \n                    WHERE user_id=$1\n                    ", [authId])];
                case 1:
                    user = (_a.sent()).rows[0];
                    if (!user.is_active)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "Please activate your account first.",
                            })];
                    if (user.is_blocked)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "Your account has been blocked please contact us to know why, thank you.",
                            })];
                    user_id = user.user_id, version = user.version, is_admin = user.is_admin, is_super_admin = user.is_super_admin, is_admin_assistant = user.is_admin_assistant, is_writer = user.is_writer, is_editor = user.is_editor, is_reporter = user.is_reporter;
                    if (version !== decoded.version) {
                        authCookies_1.setAuthCookies(res, {
                            version: version,
                            is_admin: is_admin,
                            is_super_admin: is_super_admin,
                            is_admin_assistant: is_admin_assistant,
                            is_writer: is_writer,
                            user_id: user_id,
                            is_editor: is_editor,
                            is_reporter: is_reporter,
                        });
                        req.modifedUser = user;
                    }
                    req.decoded = decoded;
                    return [2 /*return*/, next()];
                case 2: return [2 /*return*/, next({
                        status: 401,
                        message: "unauthorized.",
                    })];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 4: return [2 /*return*/];
            }
        });
    }); });
};
exports.isLoggedIn = isLoggedIn;

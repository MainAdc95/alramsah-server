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
exports.resendEmail = exports.activateAccount = exports.signout = exports.signinOnload = exports.signin = exports.signup = void 0;
var validators_1 = __importDefault(require("../utils/validators"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var db_1 = require("../utils/db");
var authCookies_1 = require("../utils/authCookies");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var config_1 = __importDefault(require("../config"));
var uuid_1 = require("uuid");
var email_1 = require("../utils/email");
var userQuery = function (filter) { return "    \n    SELECT\n        u.user_id,\n        jsonb_build_object (\n            'image_id', ui.image_id,\n            'image_id', ui.image_id\n        ) as avatar,\n        u.username,\n        u.first_name,\n        u.last_name,\n        u.email,\n        u.phone,\n        u.password,\n        u.version,\n        u.is_admin_assistant,\n        u.is_writer,\n        u.is_admin,\n        u.is_active,\n        u.is_blocked,\n        u.is_super_admin,\n        u.is_editor,\n        u.is_reporter\n    FROM users u\n        LEFT JOIN user_images ui ON u.avatar=ui.image_id\n    " + (filter || "") + "\n"; };
function signup(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, username, first_name, last_name, email, phone, password, password2, errors, foundUsername, foundEmail, _i, _b, v, hashPassword, userId, accountActivationToken, activationLink, html, user, user_id, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 14, , 15]);
                    _a = req.body, username = _a.username, first_name = _a.first_name, last_name = _a.last_name, email = _a.email, phone = _a.phone, password = _a.password, password2 = _a.password2;
                    // data manipulation
                    username = username === null || username === void 0 ? void 0 : username.trim();
                    first_name = first_name === null || first_name === void 0 ? void 0 : first_name.trim();
                    last_name = last_name === null || last_name === void 0 ? void 0 : last_name.trim();
                    email = email === null || email === void 0 ? void 0 : email.trim().toLowerCase();
                    phone = phone === null || phone === void 0 ? void 0 : phone.trim();
                    password = password === null || password === void 0 ? void 0 : password.trim();
                    password2 = password2 === null || password2 === void 0 ? void 0 : password2.trim();
                    errors = {
                        username: [],
                        first_name: [],
                        last_name: [],
                        email: [],
                        phone: [],
                        password: [],
                        password2: [],
                    };
                    if (!username) return [3 /*break*/, 4];
                    if (!validators_1.default.range(username, 3, 20)) return [3 /*break*/, 1];
                    errors.username.push("Please enter a username between 3 and 20 characters.");
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, db_1.pool.query("SELECT username FROM users WHERE username=$1", [username])];
                case 2:
                    foundUsername = _c.sent();
                    if (foundUsername.rowCount)
                        errors.username.push("This username already exists in our system.");
                    _c.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    errors.username.push("Please enter a username.");
                    _c.label = 5;
                case 5:
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
                    if (!email) return [3 /*break*/, 9];
                    if (!validators_1.default.isEmail(email)) return [3 /*break*/, 6];
                    errors.email.push("Please enter a valid email address.");
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, db_1.pool.query("SELECT username FROM users WHERE email=$1", [email])];
                case 7:
                    foundEmail = _c.sent();
                    if (foundEmail.rowCount)
                        errors.email.push("This email address already exists in our system.");
                    _c.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    errors.email.push("Please enter your email address.");
                    _c.label = 10;
                case 10:
                    if (password) {
                        if (validators_1.default.minLength(password, 8))
                            errors.password.push("Please enter a password that is at least 8 characters.");
                    }
                    else
                        errors.password.push("Please enter a password.");
                    if (password2) {
                        if (password !== password2)
                            errors.password2.push("Those passwords didn't match.");
                    }
                    else
                        errors.password2.push("Please repeat your password.");
                    // _____ check for errors _______
                    for (_i = 0, _b = Object.values(errors); _i < _b.length; _i++) {
                        v = _b[_i];
                        if (v.length)
                            return [2 /*return*/, next({
                                    status: 400,
                                    message: errors,
                                })];
                    }
                    return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                case 11:
                    hashPassword = _c.sent();
                    userId = uuid_1.v4();
                    // creating a user in the data base
                    return [4 /*yield*/, db_1.pool.query("INSERT INTO users (\n                user_id,\n                avatar,\n                username,\n                first_name,\n                last_name,\n                email,\n                phone,\n                password,\n                version\n            ) \n            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) \n            ", [
                            userId,
                            "2d06f735-f13c-4142-803b-6834648fed2d",
                            username,
                            first_name,
                            last_name,
                            email,
                            phone,
                            hashPassword,
                            1,
                        ])];
                case 12:
                    // creating a user in the data base
                    _c.sent();
                    accountActivationToken = jsonwebtoken_1.default.sign({ userId: userId }, config_1.default.jwtSecret, {
                        expiresIn: "10m",
                    });
                    activationLink = config_1.default.domain + "/auth/activate_account/" + accountActivationToken;
                    html = "\n            <h1>Account activation</h1>\n            <p style=\"font-size: 20px;\">Click this <a href=\"" + activationLink + "\">link</a> to active your account.</p>\n        ";
                    email_1.sendSyncEmail("noreply", "Account activation - Alramsah", html, email);
                    return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.user_id=$1"), [userId])];
                case 13:
                    user = (_c.sent()).rows[0];
                    user_id = user.user_id;
                    return [2 /*return*/, res.status(201).json({
                            user_id: user_id,
                        })];
                case 14:
                    err_1 = _c.sent();
                    return [2 /*return*/, next(err_1)];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.signup = signup;
function signin(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, identifier, password, user, user, isMatch, user_id, version, is_admin, is_super_admin, is_editor, is_admin_assistant, is_writer, is_reporter, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.body, identifier = _a.identifier, password = _a.password;
                    // data manipulation
                    identifier = String(identifier).trim();
                    password = String(password).trim();
                    // validating data
                    if (!identifier || !password)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "Please fill in all the empty blanks.",
                            })];
                    return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.email=$1"), [identifier])];
                case 1:
                    user = (_b.sent()).rows[0];
                    if (!!user) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.username=$1"), [identifier])];
                case 2:
                    user = (_b.sent()).rows[0];
                    _b.label = 3;
                case 3:
                    if (!user)
                        return [2 /*return*/, next({
                                status: 401,
                                message: "Your login credentials don't match an account in our system.",
                            })];
                    return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
                case 4:
                    isMatch = _b.sent();
                    if (!isMatch)
                        return [2 /*return*/, next({
                                status: 401,
                                message: "Your login credentials don't match an account in our system.",
                            })];
                    // check if the user can signin
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
                    user_id = user.user_id, version = user.version, is_admin = user.is_admin, is_super_admin = user.is_super_admin, is_editor = user.is_editor, is_admin_assistant = user.is_admin_assistant, is_writer = user.is_writer, is_reporter = user.is_reporter;
                    // generating a jsonwebtoken for authentication and saving them in the cookies
                    authCookies_1.setAuthCookies(res, {
                        version: version,
                        is_admin: is_admin,
                        is_super_admin: is_super_admin,
                        user_id: user_id,
                        is_editor: is_editor,
                        is_admin_assistant: is_admin_assistant,
                        is_writer: is_writer,
                        is_reporter: is_reporter,
                    });
                    return [2 /*return*/, res.status(200).json({
                            user_id: user_id,
                            avatar: user.avatar,
                            username: user.username,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            email: user.email,
                            phone: user.phone,
                            version: version,
                            is_admin: is_admin,
                            is_super_admin: is_super_admin,
                            is_admin_assistant: is_admin_assistant,
                            is_writer: is_writer,
                            is_editor: is_editor,
                            is_reporter: is_reporter,
                        })];
                case 5:
                    err_2 = _b.sent();
                    return [2 /*return*/, next(err_2)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.signin = signin;
function signinOnload(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        var _this = this;
        return __generator(this, function (_a) {
            token = null;
            if (req.cookies)
                token = req.cookies.jwt;
            if (!token)
                return [2 /*return*/, next({
                        status: 401,
                        message: "Please login first.",
                    })];
            jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret, function (err, decoded) { return __awaiter(_this, void 0, void 0, function () {
                var user, username, first_name, last_name, email, phone, user_id, avatar, version, is_admin, is_super_admin, is_editor, is_reporter, is_admin_assistant, is_writer, err_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            if (err)
                                return [2 /*return*/, next(err)];
                            if (!decoded) return [3 /*break*/, 2];
                            return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.user_id=$1"), [decoded.user_id])];
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
                            username = user.username, first_name = user.first_name, last_name = user.last_name, email = user.email, phone = user.phone, user_id = user.user_id, avatar = user.avatar, version = user.version, is_admin = user.is_admin, is_super_admin = user.is_super_admin, is_editor = user.is_editor, is_reporter = user.is_reporter, is_admin_assistant = user.is_admin_assistant, is_writer = user.is_writer;
                            if (decoded.user_id !== req.params.id) {
                                // user detials
                                if (version !== decoded.version) {
                                    // generating a jsonwebtoken for authentication and saving them in the cookies
                                    authCookies_1.setAuthCookies(res, {
                                        version: version,
                                        is_admin: is_admin,
                                        is_super_admin: is_super_admin,
                                        user_id: user_id,
                                        is_admin_assistant: is_admin_assistant,
                                        is_writer: is_writer,
                                        is_editor: is_editor,
                                        is_reporter: is_reporter,
                                    });
                                }
                            }
                            return [2 /*return*/, res.status(200).json({
                                    user_id: user_id,
                                    username: username,
                                    first_name: first_name,
                                    last_name: last_name,
                                    email: email,
                                    phone: phone,
                                    version: version,
                                    avatar: avatar,
                                    is_admin_assistant: is_admin_assistant,
                                    is_writer: is_writer,
                                    is_admin: is_admin,
                                    is_super_admin: is_super_admin,
                                    is_editor: is_editor,
                                    is_reporter: is_reporter,
                                })];
                        case 2: return [3 /*break*/, 4];
                        case 3:
                            err_3 = _a.sent();
                            return [2 /*return*/, next(err_3)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
exports.signinOnload = signinOnload;
function signout(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // remove auth cookies = sign out user
                authCookies_1.removeAuthCookies(res);
                return [2 /*return*/, res.status(200).json({ message: "You signed out." })];
            }
            catch (err) {
                return [2 /*return*/, next(err)];
            }
            return [2 /*return*/];
        });
    });
}
exports.signout = signout;
function activateAccount(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        var _this = this;
        return __generator(this, function (_a) {
            try {
                token = req.params.token;
                jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret, function (err, decoded) { return __awaiter(_this, void 0, void 0, function () {
                    var err_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err)
                                    return [2 /*return*/, res.status(410).send("<h1>This link is expired.</h1>")];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, db_1.pool.query("\n                    UPDATE users\n                    SET\n                        is_active=true\n                    WHERE user_id=$1\n                ", [decoded.userId])];
                            case 2:
                                _a.sent();
                                res.redirect(config_1.default.clientDomain + "/signin");
                                return [3 /*break*/, 4];
                            case 3:
                                err_4 = _a.sent();
                                return [2 /*return*/, next(err_4)];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
            }
            catch (err) {
                return [2 /*return*/, next(err)];
            }
            return [2 /*return*/];
        });
    });
}
exports.activateAccount = activateAccount;
function resendEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, user, email, accountActivationToken, activationLink, html, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.params.userId;
                    return [4 /*yield*/, db_1.pool.query(userQuery("WHERE u.user_id=$1"), [userId])];
                case 1:
                    user = (_a.sent()).rows[0];
                    if (!user)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "There is no account in our system with this id " + userId + ".",
                            })];
                    email = user.email;
                    accountActivationToken = jsonwebtoken_1.default.sign({ userId: userId }, config_1.default.jwtSecret, {
                        expiresIn: "10m",
                    });
                    activationLink = config_1.default.domain + "/auth/activate_account/" + accountActivationToken;
                    html = "\n            <h1>Account activation</h1>\n            <p style=\"font-size: 20px;\">Click this <a href=\"" + activationLink + "\">link</a> to active your account.</p>\n        ";
                    email_1.sendSyncEmail("noreply", "Account activation - Alramsah", html, email);
                    return [2 /*return*/, res.status(200).json("")];
                case 2:
                    err_5 = _a.sent();
                    return [2 /*return*/, next(err_5)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.resendEmail = resendEmail;

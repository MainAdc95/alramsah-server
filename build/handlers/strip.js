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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStrip = exports.editStrip = exports.addStrip = exports.getStrips = exports.getStrip = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var stripQuery = function (filter, order, limit, offset) { return "\n    SELECT\n        s.strip_id,\n        s.title,\n        s.link,\n        s.duration,\n        s.type,\n        s.created_at,\n        s.updated_at,\n        jsonb_build_object (\n            'user_id', cb.user_id,\n            'username', cb.username\n        ) as created_by,\n        jsonb_build_object (\n            'user_id', ub.user_id,\n            'username', ub.username\n        ) as updated_by\n    FROM strips s\n        LEFT JOIN users cb ON cb.user_id=s.created_by\n        LEFT JOIN users ub ON ub.user_id=s.updated_by\n    " + (filter || "") + "\n    GROUP BY s.strip_id, cb.user_id, ub.user_id\n    " + (order || "ORDER BY s.created_at desc") + "\n    " + (limit || "LIMIT 100") + "\n    " + (offset || "") + "\n"; };
function getStrip(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var stripId, strip, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    stripId = req.params.stripId;
                    return [4 /*yield*/, db_1.pool.query(stripQuery("WHERE s.strip_id=$1", "", "", ""), [
                            stripId,
                        ])];
                case 1:
                    strip = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(strip)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getStrip = getStrip;
function getStrips(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var strips, err_2, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db_1.pool.query(stripQuery("", "", "", ""))];
                case 2:
                    strips = (_a.sent()).rows;
                    return [2 /*return*/, res.status(200).json(strips)];
                case 3:
                    err_2 = _a.sent();
                    return [2 /*return*/, next(err_2)];
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    return [2 /*return*/, next(err_3)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.getStrips = getStrips;
function addStrip(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, title, link, duration, type, stripId, date, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    _a = req.body, title = _a.title, link = _a.link, duration = _a.duration, type = _a.type;
                    title = String(title).trim();
                    link = String(link).trim();
                    type = String(type).trim();
                    stripId = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO strips (\n                strip_id,\n                title,\n                link,\n                duration,\n                type,\n                created_at,\n                updated_at,\n                updated_by,\n                created_by\n            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)\n            ", [stripId, title, link, duration, type, date, date, authId, authId])];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(201).json("")];
                case 2:
                    err_4 = _b.sent();
                    return [2 /*return*/, next(err_4)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.addStrip = addStrip;
function editStrip(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, stripId, _a, title, link, duration, type, date, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    stripId = req.params.stripId;
                    _a = req.body, title = _a.title, link = _a.link, duration = _a.duration, type = _a.type;
                    title = String(title).trim();
                    link = String(link).trim();
                    type = String(type).trim();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE strips\n            SET\n                link=$1,\n                duration=$2,\n                type=$3,\n                updated_at=$4,\n                updated_by=$5,\n                title=$6\n            WHERE strip_id=$7\n            ", [link, duration, type, date, authId, title, stripId])];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json("")];
                case 2:
                    err_5 = _b.sent();
                    return [2 /*return*/, next(err_5)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.editStrip = editStrip;
function deleteStrip(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var stripId, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    stripId = req.params.stripId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM strips WHERE strip_id=$1", [stripId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ messages: "You have successfully deleted a strip." })];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, next(err_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.deleteStrip = deleteStrip;

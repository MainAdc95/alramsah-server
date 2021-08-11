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
exports.deleteTag = exports.editTag = exports.addTag = exports.getTags = exports.getTag = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var query = function (filter, order, limit, offset) { return "\n            SELECT\n                t.tag_id,\n                t.tag_name,\n                t.tag_order,\n                t.created_at,\n                t.updated_at,\n                jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username\n                ) as created_by,\n                jsonb_build_object (\n                    'user_id', ub.user_id,\n                    'username', ub.username\n                ) as updated_by\n            FROM tags t\n                LEFT JOIN users cb ON cb.user_id=t.created_by\n                LEFT JOIN users ub ON ub.user_id=t.updated_by\n            " + (filter || "") + "\n            GROUP BY t.tag_id, cb.user_id, ub.user_id\n            " + (order || "ORDER BY t.created_at desc") + "\n            " + (limit || "") + "\n            " + (offset || "") + "\n        "; };
function getTag(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var tagId, tag, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tagId = req.params.tagId;
                    return [4 /*yield*/, db_1.pool.query(query("WHERE t.tag_id=$1"), [
                            tagId,
                        ])];
                case 1:
                    tag = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(tag)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getTag = getTag;
var sum = function (times, value) {
    var totalValue = 0;
    for (var i = 0; i < times; i++) {
        totalValue += value;
    }
    return totalValue - value;
};
function getTags(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, p, r, count, tags_1, tags, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.query, p = _a.p, r = _a.r;
                    p = Number(p);
                    r = r ? Number(r) : 20;
                    if (!(p && r)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.pool.query("SELECT count(*) FROM tags")];
                case 1:
                    count = (_b.sent()).rows[0].count;
                    return [4 /*yield*/, db_1.pool.query(query("", "", r ? "LIMIT " + r : "", "OFFSET " + sum(p, r)))];
                case 2:
                    tags_1 = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({
                            results: count,
                            tags: tags_1,
                        })];
                case 3: return [4 /*yield*/, db_1.pool.query(query())];
                case 4:
                    tags = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json(tags)];
                case 5:
                    err_2 = _b.sent();
                    return [2 /*return*/, next(err_2)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.getTags = getTags;
function addTag(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, tag_name, errors, _i, _a, v, tagId, date, tag, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    authId = req.query.authId;
                    tag_name = req.body.tag_name;
                    tag_name = String(tag_name).trim();
                    errors = {
                        tag_name: [],
                    };
                    if (!tag_name)
                        errors.tag_name.push("Please fill in tag name.");
                    for (_i = 0, _a = Object.values(errors); _i < _a.length; _i++) {
                        v = _a[_i];
                        if (v.length)
                            return [2 /*return*/, next({
                                    status: 400,
                                    message: errors,
                                })];
                    }
                    tagId = uuid_1.v4();
                    date = new Date();
                    // __________________________ add tag
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO tags (\n                tag_id,\n                tag_name,\n                created_at,\n                updated_at,\n                created_by,\n                updated_by\n            ) VALUES ($1, $2, $3, $4, $5, $6)\n            ", [tagId, tag_name, date, date, authId, authId])];
                case 1:
                    // __________________________ add tag
                    _b.sent();
                    return [4 /*yield*/, db_1.pool.query(query("WHERE t.tag_id=$1", "", ""), [tagId])];
                case 2:
                    tag = (_b.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(tag)];
                case 3:
                    err_3 = _b.sent();
                    return [2 /*return*/, next(err_3)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.addTag = addTag;
function editTag(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, tagId, tag_name, errors, _i, _a, v, date, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    tagId = req.params.tagId;
                    tag_name = req.body.tag_name;
                    tag_name = String(tag_name).trim();
                    errors = {
                        tag_name: [],
                    };
                    if (!tag_name)
                        errors.tag_name.push("Please fill in tag name.");
                    for (_i = 0, _a = Object.values(errors); _i < _a.length; _i++) {
                        v = _a[_i];
                        if (v.length)
                            return [2 /*return*/, next({
                                    status: 400,
                                    message: errors,
                                })];
                    }
                    date = new Date();
                    // __________________________ add tag
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE tags\n            SET\n                tag_name=$1,\n                updated_at=$2,\n                updated_by=$3\n            WHERE tag_id=$4\n            ", [tag_name, date, authId, tagId])];
                case 1:
                    // __________________________ add tag
                    _b.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully edit a tag." })];
                case 2:
                    err_4 = _b.sent();
                    return [2 /*return*/, next(err_4)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.editTag = editTag;
function deleteTag(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var tagId, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    tagId = req.params.tagId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM tags WHERE tag_id=$1", [tagId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully deleted a tag." })];
                case 2:
                    err_5 = _a.sent();
                    return [2 /*return*/, next(err_5)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.deleteTag = deleteTag;

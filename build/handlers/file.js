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
exports.deleteFile = exports.editFile = exports.addFile = exports.getFiles = exports.getFile = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var fileQuery = function (filter, order, limit, offset) { return "\n    SELECT\n        f.file_id,\n        f.text,\n        f.created_at,\n        f.updated_at,\n        jsonb_build_object (\n            'user_id', cb.user_id,\n            'username', cb.username\n        ) as created_by,\n        jsonb_build_object (\n            'user_id', ub.user_id,\n            'username', ub.username\n        ) as updated_by,\n        CASE WHEN count(i)=0 THEN null ELSE jsonb_build_object (\n            'image_id', i.image_id,\n            'sizes', i.sizes\n        ) END AS image\n    FROM files f\n        LEFT JOIN users cb ON cb.user_id=f.created_by\n        LEFT JOIN users ub ON ub.user_id=f.updated_by\n        LEFT JOIN images i ON i.image_id=f.image_id\n    " + (filter || "") + "\n    GROUP BY f.file_id, cb.user_id, ub.user_id, i.image_id\n    " + (order || "ORDER BY f.created_at desc") + "\n    " + (limit || "LIMIT 100") + "\n    " + (offset || "") + "\n"; };
function getFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId, file, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    fileId = req.params.fileId;
                    return [4 /*yield*/, db_1.pool.query(fileQuery("WHERE f.file_id=$1", "", "", ""), [
                            fileId,
                        ])];
                case 1:
                    file = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(file)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getFile = getFile;
function getFiles(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var files, err_2, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db_1.pool.query(fileQuery("", "", "", ""))];
                case 2:
                    files = (_a.sent()).rows;
                    return [2 /*return*/, res.status(200).json(files)];
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
exports.getFiles = getFiles;
function addFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, text, image, fileId, date, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    _a = req.body, text = _a.text, image = _a.image;
                    text = String(text).trim();
                    fileId = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO files (\n                file_id,\n                text,\n                image_id,\n                created_at,\n                updated_at,\n                updated_by,\n                created_by\n            ) VALUES ($1, $2, $3, $4, $5, $6, $7)\n            ", [fileId, text, image.image_id, date, date, authId, authId])];
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
exports.addFile = addFile;
function editFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, fileId, _a, text, image, date, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    fileId = req.params.fileId;
                    _a = req.body, text = _a.text, image = _a.image;
                    text = String(text).trim();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE files\n            SET\n                text=$1,\n                image_id=$2,\n                updated_at=$3,\n                updated_by=$4\n            WHERE file_id=$5\n            ", [text, image.image_id, date, authId, fileId])];
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
exports.editFile = editFile;
function deleteFile(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var fileId, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    fileId = req.params.fileId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM files WHERE file_id=$1", [fileId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ messages: "You have successfully deleted a file." })];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, next(err_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.deleteFile = deleteFile;

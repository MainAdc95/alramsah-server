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
exports.deleteNewsLetter = exports.subscribeNewsLetter = exports.getNewsLetter = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var newsLetterQuery = function (filter, order, limit, offset) { return "\n    SELECT\n        nl.news_letter_id,\n        nl.email,\n        nl.created_at\n    FROM news_letter nl\n    " + (filter || "") + "\n    " + (order || "ORDER BY created_at DESC") + "\n    " + (limit || "LIMIT 100") + "\n    " + (offset || "") + "\n"; };
var sum = function (times, value) {
    var totalValue = 0;
    for (var i = 0; i < times; i++) {
        totalValue += value;
    }
    return totalValue - value;
};
function getNewsLetter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, p, r, results, newsLetter, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.query, p = _a.p, r = _a.r;
                    p = Number(p);
                    r = Number(r);
                    return [4 /*yield*/, db_1.pool.query("SELECT count(*) as results FROM news_letter")];
                case 1:
                    results = (_b.sent()).rows[0].results;
                    results = Number(results);
                    return [4 /*yield*/, db_1.pool.query(newsLetterQuery("", "", r ? "LIMIT " + r : "", "OFFSET " + sum(p, r)))];
                case 2:
                    newsLetter = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({
                            results: results,
                            newsLetter: newsLetter,
                        })];
                case 3:
                    err_1 = _b.sent();
                    return [2 /*return*/, next(err_1)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getNewsLetter = getNewsLetter;
function subscribeNewsLetter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var email, newsLetterId, date, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    email = req.body.email;
                    email = String(email).trim().toLowerCase();
                    newsLetterId = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO news_letter (\n                news_letter_id,\n                email,\n                created_at\n            ) VALUES ($1, $2, $3)\n            ", [newsLetterId, email, date])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(201).json("")];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, next(err_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.subscribeNewsLetter = subscribeNewsLetter;
function deleteNewsLetter(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var newsLetterId, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    newsLetterId = req.params.newsLetterId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM news_letter WHERE news_letter_id=$1", [
                            newsLetterId,
                        ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json("")];
                case 2:
                    err_3 = _a.sent();
                    return [2 /*return*/, next(err_3)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.deleteNewsLetter = deleteNewsLetter;

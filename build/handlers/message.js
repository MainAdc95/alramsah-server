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
exports.sendMessage = exports.getMessages = exports.getMessage = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var pg_format_1 = __importDefault(require("pg-format"));
var messageQuery = function (filter, order, limit) { return "\n    SELECT\n        m.message_id,\n        m.subject,\n        m.text,\n        m.created_at,\n        m.to_user,\n        jsonb_build_object (\n            'user_id', cb.user_id,\n            'username', cb.username\n        ) as created_by,\n        CASE WHEN count(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END AS images\n    FROM messages m\n        LEFT JOIN users cb ON cb.user_id=m.created_by\n        LEFT JOIN (\n            SELECT\n                mi.message_id,\n                jsonb_build_object (\n                    'image_id', i.image_id,\n                    'sizes', i.sizes\n                ) as image\n            FROM message_image mi\n                LEFT JOIN images i ON i.image_id=mi.image_id\n        ) as i\n            ON i.message_id=m.message_id\n    " + (filter || "") + "\n    GROUP BY m.message_id, cb.user_id\n    " + (order || "ORDER BY m.created_at desc") + "\n    " + (limit || "LIMIT 100") + "\n"; };
function getMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var messageId, message, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    messageId = req.params.messageId;
                    return [4 /*yield*/, db_1.pool.query(messageQuery("WHERE m.message_id=$1"), [
                            messageId,
                        ])];
                case 1:
                    message = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(message)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getMessage = getMessage;
function getMessages(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, p, r, authId, count, messages, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.query, p = _a.p, r = _a.r, authId = _a.authId;
                    return [4 /*yield*/, db_1.pool.query("SELECT \n                COUNT(*) AS count\n            FROM messages \n            WHERE to_user=$1\n            ", [authId])];
                case 1:
                    count = (_b.sent()).rows[0].count;
                    return [4 /*yield*/, db_1.pool.query(messageQuery(p
                            ? "WHERE m.message_order < " + Number(Number(p) === 1 ? count + 1 : count) /
                                Number(p) + " AND to_user=$1"
                            : "WHERE m.to_user=$1", "", "LIMIT " + r), [authId])];
                case 2:
                    messages = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({ count: count, messages: messages })];
                case 3:
                    err_2 = _b.sent();
                    return [2 /*return*/, next(err_2)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getMessages = getMessages;
function sendMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, subject, text, to, images, messageId_1, date, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    authId = req.query.authId;
                    _a = req.body, subject = _a.subject, text = _a.text, to = _a.to, images = _a.images;
                    messageId_1 = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO messages (\n                message_id,\n                subject,\n                text,\n                to_user,\n                created_by,\n                created_at\n            ) VALUES ($1, $2, $3, $4, $5, $6)\n            ", [messageId_1, subject, text, to, authId, date])];
                case 1:
                    _b.sent();
                    if (!images.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n            INSERT INTO message_image (\n                message_id,\n                image_id\n            ) VALUES %L\n            ", images.map(function (img) { return [messageId_1, img.image_id]; })))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, res
                        .status(201)
                        .json({ message: "You have successfully sent a message." })];
                case 4:
                    err_3 = _b.sent();
                    return [2 /*return*/, next(err_3)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.sendMessage = sendMessage;

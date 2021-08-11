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
exports.vote = exports.deletePoll = exports.editPoll = exports.addPoll = exports.getPolls = exports.getPoll = exports.getActivePoll = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var pg_format_1 = __importDefault(require("pg-format"));
var pollQuery = function (filter, order) { return "\n    SELECT\n        p.poll_id,\n        p.title,\n        p.is_active,\n        p.created_at,\n        p.updated_at,\n        jsonb_build_object (\n            'user_id', cb.user_id,\n            'username', cb.username\n        ) as created_by,\n        jsonb_build_object (\n            'user_id', ub.user_id,\n            'username', ub.username\n        ) as updated_by,\n        CASE WHEN count(op)=0 THEN ARRAY[]::JSONB[] ELSE array_agg(\n            jsonb_build_object (\n                'option_id', op.option_id,\n                'name', op.name,\n                'votes', op.votes,\n                'created_at', op.created_at\n            )\n        ) END AS options\n    FROM polls p\n        LEFT JOIN users cb ON cb.user_id=p.created_by\n        LEFT JOIN users ub ON ub.user_id=p.updated_by\n        LEFT JOIN poll_options op ON op.poll_id=p.poll_id\n    " + (filter || "") + "    \n    GROUP BY p.poll_id, cb.user_id, ub.user_id\n    " + (order || "ORDER BY p.created_at DESC") + "    \n"; };
function getActivePoll(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var poll, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.pool.query(pollQuery("\n                WHERE p.is_active=true\n                "))];
                case 1:
                    poll = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(poll)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getActivePoll = getActivePoll;
function getPoll(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var is_active, pollId, poll, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    is_active = req.query.is_active;
                    pollId = req.params.pollId;
                    return [4 /*yield*/, db_1.pool.query(pollQuery("\n                WHERE p.poll_id=$1 \n                " + (is_active ? "AND p.is_active=" + is_active : "") + "\n                "), [pollId])];
                case 1:
                    poll = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(poll)];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, next(err_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getPoll = getPoll;
function getPolls(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var polls, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.pool.query(pollQuery())];
                case 1:
                    polls = (_a.sent()).rows;
                    return [2 /*return*/, res.status(200).json(polls)];
                case 2:
                    err_3 = _a.sent();
                    return [2 /*return*/, next(err_3)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getPolls = getPolls;
function addPoll(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, title, is_active, options, pollId_1, date, err_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    authId = req.query.authId;
                    _a = req.body, title = _a.title, is_active = _a.is_active, options = _a.options;
                    title = String(title).trim();
                    is_active = Boolean(is_active);
                    pollId_1 = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n                INSERT INTO polls (\n                    poll_id,\n                    title,\n                    is_active,\n                    created_by,\n                    updated_by,\n                    updated_at,\n                    created_at\n                ) VALUES ($1, $2,  $3, $4, $5, $6, $7)\n                ", [pollId_1, title, is_active, authId, authId, date, date])];
                case 1:
                    _b.sent();
                    // ___________________________ options
                    if (!(options === null || options === void 0 ? void 0 : options.length))
                        options = [{ name: "نعم" }, { name: "لا" }];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO poll_options (\n                    option_id,\n                    name,\n                    votes,\n                    poll_id,\n                    created_at\n                ) VALUES %L\n                ", options.map(function (o) { return [uuid_1.v4(), o.name, 0, pollId_1, new Date()]; })))];
                case 2:
                    _b.sent();
                    if (!is_active) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE polls\n            SET\n                is_active=false\n            WHERE is_active=true AND poll_id != $1\n            ", [pollId_1])];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, res.status(201).json("")];
                case 5:
                    err_4 = _b.sent();
                    return [2 /*return*/, next(err_4)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.addPoll = addPoll;
function editPoll(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, pollId, _a, title, is_active, options, date, oldOptions, delOptions, addOptions, _loop_1, _i, options_1, option, _loop_2, _b, oldOptions_1, option, err_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    authId = req.query.authId;
                    pollId = req.params.pollId;
                    _a = req.body, title = _a.title, is_active = _a.is_active, options = _a.options;
                    title = String(title).trim();
                    is_active = Boolean(is_active);
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n                UPDATE polls\n                SET\n                    title=$1,\n                    updated_by=$2,\n                    updated_at=$3,\n                    is_active=$4\n                WHERE poll_id=$5\n                ", [title, authId, date, is_active, pollId])];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                po.option_id,\n                po.name\n            FROM poll_options po\n            WHERE po.poll_id=$1\n            ", [pollId])];
                case 2:
                    oldOptions = (_c.sent()).rows;
                    if (!(options === null || options === void 0 ? void 0 : options.length)) return [3 /*break*/, 6];
                    delOptions = [];
                    addOptions = [];
                    _loop_1 = function (option) {
                        var foundOption = oldOptions.find(function (i) { return i.option_id === option.option_id; });
                        if (!foundOption)
                            addOptions.push([
                                uuid_1.v4(),
                                option.name,
                                0,
                                pollId,
                                new Date(),
                            ]);
                    };
                    // add / delete logic
                    for (_i = 0, options_1 = options; _i < options_1.length; _i++) {
                        option = options_1[_i];
                        _loop_1(option);
                    }
                    _loop_2 = function (option) {
                        var foundOption = options.find(function (i) { return i.option_id === option.option_id; });
                        if (!foundOption)
                            delOptions.push([option.option_id]);
                    };
                    for (_b = 0, oldOptions_1 = oldOptions; _b < oldOptions_1.length; _b++) {
                        option = oldOptions_1[_b];
                        _loop_2(option);
                    }
                    if (!addOptions.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        INSERT INTO poll_options (\n                            option_id,\n                            name,\n                            votes,\n                            poll_id,\n                            created_at\n                        ) VALUES %L\n                        ", addOptions))];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    if (!delOptions.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        DELETE FROM poll_options WHERE option_id IN (%L)\n                        ", delOptions))];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    if (!is_active) return [3 /*break*/, 8];
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE polls\n            SET\n                is_active=false\n            WHERE is_active=true AND poll_id != $1\n            ", [pollId])];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [2 /*return*/, res.status(200).json("")];
                case 9:
                    err_5 = _c.sent();
                    return [2 /*return*/, next(err_5)];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.editPoll = editPoll;
function deletePoll(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var pollId, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    pollId = req.params.pollId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM polls WHERE poll_id=$1", [pollId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully deleted a poll." })];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, next(err_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.deletePoll = deletePoll;
function vote(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var optionId, number, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    optionId = req.params.optionId;
                    number = req.body.number;
                    return [4 /*yield*/, db_1.pool.query("UPDATE poll_options SET votes = votes + $1 WHERE option_id=$2", [number, optionId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res.status(200).json("")];
                case 2:
                    err_7 = _a.sent();
                    return [2 /*return*/, next(err_7)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.vote = vote;

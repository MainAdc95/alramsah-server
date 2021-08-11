"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
var pg_1 = require("pg");
var config_1 = __importDefault(require("../config"));
exports.pool = new pg_1.Pool({
    host: config_1.default.db.main.host,
    port: config_1.default.db.main.port,
    user: config_1.default.db.main.user,
    password: config_1.default.db.main.password,
    database: config_1.default.db.main.database,
});

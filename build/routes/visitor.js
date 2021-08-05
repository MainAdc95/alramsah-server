"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var visitor_1 = require("../handlers/visitor");
var router = express_1.default.Router();
router.get("/visitors", visitor_1.getVisitors);
router.post("/visitors", visitor_1.addVisitor);
exports.default = router;

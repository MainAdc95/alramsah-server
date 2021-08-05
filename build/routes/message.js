"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var message_1 = require("../handlers/message");
var auth_1 = require("../middlewares/auth");
var router = express_1.default.Router();
router.get("/message/:messageId", auth_1.isLoggedIn, message_1.getMessage);
router.get("/messages", auth_1.isLoggedIn, message_1.getMessages);
router.post("/message", auth_1.isLoggedIn, message_1.sendMessage);
exports.default = router;

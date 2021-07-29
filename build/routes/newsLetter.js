"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var newsLetter_1 = require("../handlers/newsLetter");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/news_letter", auth_1.isLoggedIn, roles_1.isAdmin, newsLetter_1.getNewsLetter);
router.post("/news_letter", newsLetter_1.subscribeNewsLetter);
router.delete("/news_letter/:newsLetterId", auth_1.isLoggedIn, roles_1.isAdmin, newsLetter_1.deleteNewsLetter);
exports.default = router;

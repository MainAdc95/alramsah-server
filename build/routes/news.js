"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var news_1 = require("../handlers/news");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/news/:newsId", news_1.getNews);
router.get("/news", news_1.getAllNews);
router.get("/homeInfo", news_1.homeInfo);
router.post("/news", auth_1.isLoggedIn, roles_1.isAdmin, news_1.addNews);
router.put("/news/publish_news/:newsId", auth_1.isLoggedIn, roles_1.isAdmin, news_1.publishNews);
router.put("/news/:newsId", auth_1.isLoggedIn, roles_1.isAdmin, news_1.editNews);
router.delete("/news/:newsId", auth_1.isLoggedIn, roles_1.isAdmin, news_1.permanentlyDeleteNews);
router.put("/news/archive/:newsId", auth_1.isLoggedIn, roles_1.isAdmin, news_1.archiveNews);
exports.default = router;

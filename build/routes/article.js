"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var article_1 = require("../handlers/article");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/articles/:articleId", article_1.getArticle);
router.get("/articles", article_1.getArticles);
router.post("/articles", auth_1.isLoggedIn, function (req, res, next) {
    return roles_1.checkRole(req, next, [
        "is_super_admin",
        "is_admin",
        "is_admin_assistant",
        "is_writer",
        "is_editor",
    ]);
}, article_1.addArticle);
router.put("/articles/publish_article/:articleId", auth_1.isLoggedIn, function (req, res, next) {
    return roles_1.checkRole(req, next, [
        "is_super_admin",
        "is_admin",
        "is_admin_assistant",
    ]);
}, article_1.publishArticle);
router.put("/articles/:articleId", auth_1.isLoggedIn, roles_1.isAdmin, article_1.editArticle);
router.delete("/articles/:articleId", auth_1.isLoggedIn, roles_1.isAdmin, article_1.permanentlyDeleteArticle);
router.put("/articles/archive/:articleId", auth_1.isLoggedIn, roles_1.isAdmin, article_1.archiveArticle);
exports.default = router;

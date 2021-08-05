import express from "express";
import {
    getArticles,
    addArticle,
    editArticle,
    permanentlyDeleteArticle,
    getArticle,
    publishArticle,
    read,
    archiveArticle,
} from "../handlers/article";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin, checkRole } from "../middlewares/roles";

const router = express.Router();

router.get("/articles/:articleId", getArticle);

router.get("/articles", getArticles);

router.post(
    "/articles",
    isLoggedIn,
    (req, res, next) =>
        checkRole(req, next, [
            "is_super_admin",
            "is_admin",
            "is_admin_assistant",
            "is_writer",
            "is_editor",
        ]),
    addArticle
);

router.put(
    "/articles/publish_article/:articleId",
    isLoggedIn,
    (req, res, next) =>
        checkRole(req, next, [
            "is_super_admin",
            "is_admin",
            "is_admin_assistant",
        ]),
    publishArticle
);

router.post("/articles/:articleId/read", read);

router.put("/articles/:articleId", isLoggedIn, isAdmin, editArticle);

router.delete(
    "/articles/:articleId",
    isLoggedIn,
    isAdmin,
    permanentlyDeleteArticle
);

router.put("/articles/archive/:articleId", isLoggedIn, isAdmin, archiveArticle);

export default router;

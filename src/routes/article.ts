import express from "express";
import {
    getArticles,
    addArticle,
    editArticle,
    permanentlyDeleteArticle,
    getArticle,
    publishArticle,
    archiveArticle,
} from "../handlers/article";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/articles/:articleId", getArticle);

router.get("/articles", getArticles);

router.post("/articles", isLoggedIn, isAdmin, addArticle);

router.put(
    "/articles/publish_article/:articleId",
    isLoggedIn,
    isAdmin,
    publishArticle
);

router.put("/articles/:articleId", isLoggedIn, isAdmin, editArticle);

router.delete(
    "/articles/:articleId",
    isLoggedIn,
    isAdmin,
    permanentlyDeleteArticle
);

router.put("/articles/archive/:articleId", isLoggedIn, isAdmin, archiveArticle);

export default router;

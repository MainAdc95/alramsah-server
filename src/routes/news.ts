import express from "express";
import {
    getNews,
    addNews,
    editNews,
    permanentlyDeleteNews,
    getAllNews,
    publishNews,
    archiveNews,
    homeInfo,
    read,
    transformToArticle,
} from "../handlers/news";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin, isEditor, checkRole } from "../middlewares/roles";

const router = express.Router();

router.get("/news/:newsId", getNews);

router.get("/news", getAllNews);

router.get("/homeInfo", homeInfo);

router.post(
    "/news",
    isLoggedIn,
    (req, res, next) =>
        checkRole(req, next, [
            "is_super_admin",
            "is_admin",
            "is_admin_assistant",
            "is_editor",
        ]),
    addNews
);

router.post("/news/:newsId/read", read);

router.put(
    "/news/publish_news/:newsId",
    isLoggedIn,
    (req, res, next) =>
        checkRole(req, next, [
            "is_super_admin",
            "is_admin",
            "is_admin_assistant",
        ]),
    publishNews
);

router.post(
    "/news/:newsId/transform_article",
    isLoggedIn,
    isAdmin,
    transformToArticle
);

router.put("/news/:newsId", isLoggedIn, isEditor, editNews);

router.delete("/news/:newsId", isLoggedIn, isAdmin, permanentlyDeleteNews);

router.put("/news/archive/:newsId", isLoggedIn, isAdmin, archiveNews);

export default router;

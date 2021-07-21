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
} from "../handlers/news";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/news/:newsId", getNews);

router.get("/news", getAllNews);

router.get("/homeInfo", homeInfo);

router.post("/news", isLoggedIn, isAdmin, addNews);

router.post("/news/:newsId/read", read);

router.put("/news/publish_news/:newsId", isLoggedIn, isAdmin, publishNews);

router.put("/news/:newsId", isLoggedIn, isAdmin, editNews);

router.delete("/news/:newsId", isLoggedIn, isAdmin, permanentlyDeleteNews);

router.put("/news/archive/:newsId", isLoggedIn, isAdmin, archiveNews);

export default router;

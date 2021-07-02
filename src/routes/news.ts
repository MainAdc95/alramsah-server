import express from "express";
import {
    getNews,
    addNews,
    editNews,
    deleteNews,
    getAllNews,
    publishNews,
    homeInfo,
} from "../handlers/news";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/news/:newsId", getNews);

router.get("/news", getAllNews);

router.get("/homeInfo", homeInfo);

router.post("/news", isLoggedIn, isAdmin, addNews);

router.put("/news/publish_news/:newsId", isLoggedIn, isAdmin, publishNews);

router.put("/news/:newsId", isLoggedIn, isAdmin, editNews);

router.delete("/news/:newsId", isLoggedIn, isAdmin, deleteNews);

export default router;

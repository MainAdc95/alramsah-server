import express from "express";
import {
    getNewsLetter,
    subscribeNewsLetter,
    deleteNewsLetter,
} from "../handlers/newsLetter";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/news_letter", isLoggedIn, isAdmin, getNewsLetter);

router.post("/news_letter", subscribeNewsLetter);

router.delete(
    "/news_letter/:newsLetterId",
    isLoggedIn,
    isAdmin,
    deleteNewsLetter
);

export default router;

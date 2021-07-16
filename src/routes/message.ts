import express from "express";
import { getMessage, getMessages, sendMessage } from "../handlers/message";
import { isLoggedIn } from "../middlewares/auth";

const router = express.Router();

router.get("/message/:messageId", isLoggedIn, getMessage);

router.get("/messages", isLoggedIn, getMessages);

router.post("/message", isLoggedIn, sendMessage);

export default router;

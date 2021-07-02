import express from "express";
import { getTag, getTags, addTag, deleteTag, editTag } from "../handlers/tag";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/tag/:tagId", getTag);

router.get("/tags", getTags);

router.post("/tags", isLoggedIn, isAdmin, addTag);

router.put("/tag/:tagId", isLoggedIn, isAdmin, editTag);

router.delete("/tag/:tagId", isLoggedIn, isAdmin, deleteTag);

export default router;

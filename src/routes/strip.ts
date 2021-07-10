import express from "express";
import {
    getStrip,
    getStrips,
    addStrip,
    editStrip,
    deleteStrip,
} from "../handlers/strip";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/strip/:stripId", getStrip);

router.get("/strips", getStrips);

router.post("/strips", isLoggedIn, isAdmin, addStrip);

router.put("/strip/:stripId", isLoggedIn, isAdmin, editStrip);

router.delete("/strip/:stripId", isLoggedIn, isAdmin, deleteStrip);

export default router;

import express from "express";
import {
    getSection,
    getSections,
    editSection,
    addSection,
    deleteSection,
} from "../handlers/section";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/section/:sectionId", getSection);

router.get("/sections", getSections);

router.put("/section/:sectionId", editSection);

router.post("/sections", isLoggedIn, isAdmin, addSection);

router.delete("/section/:sectionId", isLoggedIn, isAdmin, deleteSection);

export default router;

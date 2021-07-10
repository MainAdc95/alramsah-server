import express from "express";
import {
    getFile,
    getFiles,
    addFile,
    editFile,
    deleteFile,
} from "../handlers/file";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/file/:fileId", getFile);

router.get("/files", getFiles);

router.post("/files", isLoggedIn, isAdmin, addFile);

router.put("/file/:fileId", isLoggedIn, isAdmin, editFile);

router.delete("/file/:fileId", isLoggedIn, isAdmin, deleteFile);

export default router;

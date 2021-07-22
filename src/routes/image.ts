import express from "express";
import { addImages, getImages, deleteImage } from "../handlers/image";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin, isEditor } from "../middlewares/roles";

const router = express.Router();

router.get("/images", getImages);

router.post("/images", isLoggedIn, isEditor, addImages);

router.delete("/image/:imageId", isLoggedIn, isAdmin, deleteImage);

export default router;

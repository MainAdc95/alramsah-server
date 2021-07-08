import express from "express";
import { addImages, getImages, deleteImage } from "../handlers/image";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/images", getImages);

router.post("/images", isLoggedIn, isAdmin, addImages);

router.delete("/image/:imageId", isLoggedIn, isAdmin, deleteImage);

export default router;

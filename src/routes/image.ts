import express from "express";
import { addImages, getImages, deleteImage } from "../handlers/image";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const uploadImgs = upload.array("image", 10);

router.get("/images", getImages);

router.post("/images", isLoggedIn, isAdmin, uploadImgs, addImages);

router.delete("/image/:imageName", isLoggedIn, isAdmin, deleteImage);

export default router;

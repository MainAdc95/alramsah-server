import express from "express";
import {
    addUserImages,
    getUserImages,
    deleteUserImage,
} from "../handlers/userImage";
import { isLoggedIn } from "../middlewares/auth";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const uploadImgs = upload.array("image", 10);

router.get("/user_images", isLoggedIn, getUserImages);

router.post("/user_images", isLoggedIn, uploadImgs, addUserImages);

router.delete("/user_image/:imageName(*)", isLoggedIn, deleteUserImage);

export default router;

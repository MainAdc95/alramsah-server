"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var userImage_1 = require("../handlers/userImage");
var auth_1 = require("../middlewares/auth");
var multer_1 = __importDefault(require("multer"));
var router = express_1.default.Router();
var upload = multer_1.default({ storage: multer_1.default.memoryStorage() });
var uploadImgs = upload.array("image", 10);
router.get("/user_images", auth_1.isLoggedIn, userImage_1.getUserImages);
router.post("/user_images", auth_1.isLoggedIn, uploadImgs, userImage_1.addUserImages);
router.delete("/user_image/:imageName(*)", auth_1.isLoggedIn, userImage_1.deleteUserImage);
exports.default = router;

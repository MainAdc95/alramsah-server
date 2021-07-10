"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var image_1 = require("../handlers/image");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/images", image_1.getImages);
router.post("/images", auth_1.isLoggedIn, roles_1.isAdmin, image_1.addImages);
router.delete("/image/:imageId", auth_1.isLoggedIn, roles_1.isAdmin, image_1.deleteImage);
exports.default = router;

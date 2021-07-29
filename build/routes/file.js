"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var file_1 = require("../handlers/file");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/file/:fileId", file_1.getFile);
router.get("/files", file_1.getFiles);
router.post("/files", auth_1.isLoggedIn, roles_1.isAdmin, file_1.addFile);
router.put("/file/:fileId", auth_1.isLoggedIn, roles_1.isAdmin, file_1.editFile);
router.delete("/file/:fileId", auth_1.isLoggedIn, roles_1.isAdmin, file_1.deleteFile);
exports.default = router;

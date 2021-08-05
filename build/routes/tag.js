"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tag_1 = require("../handlers/tag");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/tag/:tagId", tag_1.getTag);
router.get("/tags", tag_1.getTags);
router.post("/tags", auth_1.isLoggedIn, roles_1.isAdmin, tag_1.addTag);
router.put("/tag/:tagId", auth_1.isLoggedIn, roles_1.isAdmin, tag_1.editTag);
router.delete("/tag/:tagId", auth_1.isLoggedIn, roles_1.isAdmin, tag_1.deleteTag);
exports.default = router;

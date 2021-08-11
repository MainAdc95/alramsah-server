"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var section_1 = require("../handlers/section");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/section/:sectionId", section_1.getSection);
router.get("/sections", section_1.getSections);
router.put("/section/:sectionId", section_1.editSection);
router.post("/sections", auth_1.isLoggedIn, roles_1.isAdmin, section_1.addSection);
router.delete("/section/:sectionId", auth_1.isLoggedIn, roles_1.isAdmin, section_1.deleteSection);
exports.default = router;

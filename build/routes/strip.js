"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var strip_1 = require("../handlers/strip");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/strip/:stripId", strip_1.getStrip);
router.get("/strips", strip_1.getStrips);
router.post("/strips", auth_1.isLoggedIn, roles_1.isAdmin, strip_1.addStrip);
router.put("/strip/:stripId", auth_1.isLoggedIn, roles_1.isAdmin, strip_1.editStrip);
router.delete("/strip/:stripId", auth_1.isLoggedIn, roles_1.isAdmin, strip_1.deleteStrip);
exports.default = router;

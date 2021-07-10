"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var user_1 = require("../handlers/user");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/users", auth_1.isLoggedIn, user_1.getUsers);
router.post("/user_role/:userId", auth_1.isLoggedIn, roles_1.isSuperAdmin, user_1.manageUserRole);
router.put("/profile", auth_1.isLoggedIn, user_1.editProfile);
router.put("/user/:userId/user_role", auth_1.isLoggedIn, roles_1.isSuperAdmin, user_1.editRole);
exports.default = router;

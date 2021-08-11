"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var privacyPolicy_1 = require("../handlers/privacyPolicy");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/privacy_policy", privacyPolicy_1.getPrivacyPolicy);
router.put("/privacy_policy", auth_1.isLoggedIn, roles_1.isAdmin, privacyPolicy_1.editPrivacyPolicy);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var auth_1 = require("../handlers/auth");
var router = express_1.default.Router();
router.post("/auth/signup", auth_1.signup);
router.post("/auth/signin", auth_1.signin);
router.post("/auth/signout", auth_1.signout);
router.post("/auth/onload", auth_1.signinOnload);
router.get("/auth/activate_account/:token", auth_1.activateAccount);
router.post("/auth/resend_activate_account_email/:userId", auth_1.resendEmail);
exports.default = router;

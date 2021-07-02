import express from "express";
import {
    signup,
    signin,
    signout,
    signinOnload,
    activateAccount,
    resendEmail,
} from "../handlers/auth";

const router = express.Router();

router.post("/auth/signup", signup);

router.post("/auth/signin", signin);

router.post("/auth/signout", signout);

router.post("/auth/onload", signinOnload);

router.get("/auth/activate_account/:token", activateAccount);

router.post("/auth/resend_activate_account_email/:userId", resendEmail);

export default router;

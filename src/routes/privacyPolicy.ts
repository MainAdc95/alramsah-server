import express from "express";
import { getPrivacyPolicy, editPrivacyPolicy } from "../handlers/privacyPolicy";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/privacy_policy", getPrivacyPolicy);

router.put("/privacy_policy", isLoggedIn, isAdmin, editPrivacyPolicy);

export default router;

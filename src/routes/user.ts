import express from "express";
import {
    getUsers,
    manageUserRole,
    editProfile,
    editRole,
} from "../handlers/user";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/users", isLoggedIn, getUsers);

router.post("/user_role/:userId", isLoggedIn, isAdmin, manageUserRole);

router.put("/profile", isLoggedIn, editProfile);

router.put("/user/:userId/user_role", isLoggedIn, isAdmin, editRole);

export default router;

import express from "express";
import {
    getPoll,
    getPolls,
    addPoll,
    editPoll,
    deletePoll,
    getActivePoll,
} from "../handlers/poll";
import { isLoggedIn } from "../middlewares/auth";
import { isAdmin } from "../middlewares/roles";

const router = express.Router();

router.get("/poll/active", getActivePoll);

router.get("/poll/:pollId", getPoll);

router.get("/polls", getPolls);

router.post("/polls", isLoggedIn, isAdmin, addPoll);

router.put("/poll/:pollId", isLoggedIn, isAdmin, editPoll);

router.delete("/poll/:pollId", isLoggedIn, isAdmin, deletePoll);

export default router;

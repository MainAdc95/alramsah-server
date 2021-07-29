"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var poll_1 = require("../handlers/poll");
var auth_1 = require("../middlewares/auth");
var roles_1 = require("../middlewares/roles");
var router = express_1.default.Router();
router.get("/poll/active", poll_1.getActivePoll);
router.get("/poll/:pollId", poll_1.getPoll);
router.get("/polls", poll_1.getPolls);
router.post("/polls", auth_1.isLoggedIn, roles_1.isAdmin, poll_1.addPoll);
router.put("/poll/:pollId", auth_1.isLoggedIn, roles_1.isAdmin, poll_1.editPoll);
router.delete("/poll/:pollId", auth_1.isLoggedIn, roles_1.isAdmin, poll_1.deletePoll);
router.post("/poll/vote/:optionId", poll_1.vote);
exports.default = router;

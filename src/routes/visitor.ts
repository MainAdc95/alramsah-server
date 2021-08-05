import express from "express";
import { getVisitors, addVisitor } from "../handlers/visitor";

const router = express.Router();

router.get("/visitors", getVisitors);

router.post("/visitors", addVisitor);

export default router;

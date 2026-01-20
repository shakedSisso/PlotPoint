import { Router } from "express";
import { LogsProgress, ReviewCreate, GetBookLogs, GetBookReviews } from "../controllers/logs.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();

router.post("/createReview", ReviewCreate)

export default router;

import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { ReviewCreate, LogsProgress, GetBookLogs, GetBookReviews, updateLog, updateReview, getMyReview} from "../controllers/logs.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();
router.use(verifyToken);

router.post("/createReview", ReviewCreate);
router.post("/progress", LogsProgress);
router.get("/book-logs", GetBookLogs);
router.get("/reviews/:bookID", GetBookReviews);
router.get("/my-review/:bookId", getMyReview);

router.put("/log/:logId", updateLog);
router.put("/review/:reviewId", updateReview);

export default router;

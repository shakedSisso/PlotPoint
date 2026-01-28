import { Router } from "express";
import { buddyReadCreation, shareBuddyRead, getMyBuddyReads, endBuddyRead, deleteBuddyRead, removeSharing } from "../controllers/buddyRead.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();
router.use(verifyToken);

router.post("/create", buddyReadCreation);
router.post("/:id/share", shareBuddyRead);
router.get("/", getMyBuddyReads);

router.put("/:id/end", endBuddyRead);

router.delete("/session/:id", deleteBuddyRead);
router.delete("/share/:shareId", removeSharing);

export default router;

import { Router } from "express";
import { buddyReadCreation, shareBuddyRead, getMyBuddyReads } from "../controllers/buddyRead.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();

router.post("/create", buddyReadCreation);
router.post("/:id/share", shareBuddyRead);
router.get("/", getMyBuddyReads);

export default router;

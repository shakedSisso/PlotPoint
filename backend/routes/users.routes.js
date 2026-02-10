import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getUsers, updateProfile, deleteUser } from "../controllers/users.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();
router.use(verifyToken);

router.get("/", getUsers);
router.put("/edit", updateProfile);
router.delete("/:userId", deleteUser);

export default router;
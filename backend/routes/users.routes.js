import { Router } from "express";
import { getUsers } from "../controllers/users.controller.js";
import { deleteUser } from "../controllers/users.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();

router.get("/", getUsers);
router.delete("/:userId", deleteUser);

export default router;
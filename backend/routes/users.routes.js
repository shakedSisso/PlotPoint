import { Router } from "express";
import { getUsers } from "../controllers/users.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();

router.get("/", getUsers);

export default router;
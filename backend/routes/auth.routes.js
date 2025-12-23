import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router();

//add the paths 'register' and 'login' to the api and connect them with the corresponding functions
router.post("/register", register);
router.post("/login", login);

export default router;
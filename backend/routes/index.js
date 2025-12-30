import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from './users.routes.js';
import buddyReadRoutes from "./buddyRead.routes.js";
import bookRoutes from './book.routes.js';

//used to create routes easily instead of adding them one by one with app.<delete/get/post>
const router = Router(); 

//add the path 'auth' to the api and connect it to the paths from ./auth.routes.js
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/buddyRead", buddyReadRoutes);
router.use("/books", bookRoutes);


export default router;

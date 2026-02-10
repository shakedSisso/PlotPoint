import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { bookCreation, updateBook, deleteBook } from "../controllers/book.controller.js";

const router = Router();
router.use(verifyToken);


router.post("/create", bookCreation);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);


export default router;
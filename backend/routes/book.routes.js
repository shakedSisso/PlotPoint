import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { bookCreation, getAllBooks, updateBook, deleteBook, getBookById } from "../controllers/book.controller.js";

const router = Router();
router.get("/", getAllBooks);

router.use(verifyToken);
router.post("/create", bookCreation);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.get("/:id", getBookById);


export default router;
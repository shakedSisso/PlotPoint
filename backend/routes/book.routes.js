import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { bookCreation, getAllBooks, getBookById, updateBook, deleteBook, addByIsbn } from "../controllers/book.controller.js";

const router = Router();
router.get("/", getAllBooks);

router.use(verifyToken);
router.post("/create", bookCreation);
router.get("/:id", getBookById);

router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.get("/:id", getBookById);
router.post(
    "/add-by-isbn",
    addByIsbn
);

export default router;
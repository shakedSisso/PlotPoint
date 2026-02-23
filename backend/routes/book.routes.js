import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { bookCreation, getAllBooks, updateBook, deleteBook, getBookById, addByIsbn } from "../controllers/book.controller.js";

const router = Router();
router.get("/", getAllBooks);

router.use(verifyToken);
router.post("/create", bookCreation);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.get("/:id", getBookById);
router.post(
    "/add-by-isbn",
    (req, res, next) => {
        console.log("HIT /books/add-by-isbn (before auth)");
        next();
    },
    verifyToken,
    addByIsbn
);

export default router;
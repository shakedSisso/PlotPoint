import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createShelf, getAllShelves, addBookToShelf, getBooksFromShelf, updateShelf, removeBookFromShelf, deleteShelf, getBookStatus  } from "../controllers/shelf.controller.js";

const router = Router();
router.use(verifyToken);

router.post("/create", createShelf);
router.get("/", getAllShelves);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);

router.put("/:shelfId", updateShelf);

router.delete("/:shelfId/books/:bookId", removeBookFromShelf);
router.delete("/:shelfId", deleteShelf);

router.get("/book-status/:bookId", verifyToken, getBookStatus);


export default router;

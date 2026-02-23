import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createShelf, getAllShelves, addBookToShelf, getBookStatus ,getBooksFromShelf, updateShelf, removeBookFromShelf, deleteShelf ,getMyShelfEntries, updateBookShelf } from "../controllers/shelf.controller.js";

const router = Router();
router.use(verifyToken);

router.post("/create", createShelf);
router.get("/", getAllShelves);
router.get("/my-entries", getMyShelfEntries);

router.post("/book/update-shelf", updateBookShelf);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);

router.put("/:shelfId", updateShelf);

router.delete("/:shelfId/books/:bookId", removeBookFromShelf);
router.delete("/:shelfId", deleteShelf);

router.get("/book-status/:bookId", getBookStatus);


export default router;

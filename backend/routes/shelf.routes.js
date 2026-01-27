import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createShelf, getAllShelves, addBookToShelf, getBooksFromShelf, removeBookFromShelf, deleteShelf  } from "../controllers/shelf.controller.js";

const router = Router();
router.use(verifyToken);

router.post("/create", createShelf);
router.get("/", getAllShelves);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);
router.delete("/:shelfId/books/:bookId", removeBookFromShelf);
router.delete("/:shelfId", deleteShelf);




export default router;

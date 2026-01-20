import { Router } from "express";
import { createShelf, getAllShelves, addBookToShelf, getBooksFromShelf, removeBookFromShelf, deleteShelf  } from "../controllers/shelf.controller.js";

const router = Router();

router.post("/create", createShelf);
router.get("/", getAllShelves);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);
router.delete("/:shelfId/books/:bookId", removeBookFromShelf);
router.delete("/:shelfId", deleteShelf);




export default router;

import { Router } from "express";
import { createShelf, getAllShelves, addBookToShelf, getBooksFromShelf } from "../controllers/shelf.controller.js";

const router = Router();

router.post("/create", createShelf);
router.get("/", getAllShelves);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);

export default router;

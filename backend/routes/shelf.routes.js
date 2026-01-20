import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createShelf, getAllShelves, addBookToShelf, getBooksFromShelf } from "../controllers/shelf.controller.js";

const router = Router();
router.use(verifyToken);

router.post("/create", createShelf);
router.get("/", getAllShelves);

router.post("/add", addBookToShelf);
router.get("/:shelfName/books", getBooksFromShelf);

export default router;

import { Router } from "express";
import { createShelf, getAllShelves } from "../controllers/shelf.controller.js";

const router = Router();

router.post("/create", createShelf);
router.get("/", getAllShelves);

export default router;

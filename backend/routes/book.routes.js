import { Router } from "express";
import { bookCreation} from "../controllers/book.controller.js";

const router = Router();

router.post("/bookCreation", bookCreation);


export default router;
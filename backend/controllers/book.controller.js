import { success } from "zod";
import { Book } from "../models/book.model.js";
import { Category } from "../models/category.model.js";

import { CreateBook, CreateCategory } from "../validations/create.schema.js";

export async function bookCreation(req, res) {
    try {
        const data = CreateBook.parse(req.body);
        const nameExists = await Book.findOne({ name: data.name });

        if (nameExists)
            return res.status(409).json({ success: false, error: "This book already exists" });


        const categoryName = data.categoryName.trim();
        let categoryDoc = await Category.findOne({ name: categoryName });

        if (!categoryDoc) {
            categoryDoc = await Category.create({ name: categoryName });
        }

        console.log(categoryDoc);
        const book = await Book.create({
            name: data.name,
            length: data.length,
            author: data.author,
            category: categoryDoc._id,
            isUserAdded: data.isUserAdded,
            isPrivate: data.isPrivate
        });

        console.log(book);
        const { isUserAdded, isPrivate, _id, ...safeBook } = book.toObject();
        res.status(201).json({ success: true, book: safeBook });
    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }

        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}


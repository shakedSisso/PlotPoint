import { Book } from "../models/book.model.js";
import { Category } from "../models/category.model.js";
import { CreateBook } from "../validations/create.schema.js";

//creation of book, if Cateogry exists it refers to the _id of the category in mogodb, but if not it creat a new category.
//the book refers to the id of the category
export async function bookCreation(req, res) {
    try {
        const data = CreateBook.parse(req.body);
        const nameExists = await Book.findOne({ name: data.name });

        if (nameExists)
            return res.status(409).json({ success: false, error: "This book already exists" });


        const categoryName = data.categoryName.trim(); //the name of the category
        let categoryDoc = await Category.findOne({ name: categoryName }); //refers to the _id of the category

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
            const errors = err.issues.map(e => `${e.path.join(".")}: ${e.message}`);
            return res.status(400).json({ success: false, errors });
        }

        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}




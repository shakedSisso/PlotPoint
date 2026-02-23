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

export async function getAllBooks(req, res) {
    try {
        const books = await Book.find({ isPrivate: false }).populate('category');
        res.status(200).json(books);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function updateBook(req, res) {
    if (!req.user.isAdmin) return res.status(403).json({ success: false, error: "Admin only" });
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, book });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function deleteBook(req, res) {
    if (!req.user.isAdmin) return res.status(403).json({ success: false, error: "Admin only" });
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Book deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}

// Get a single book by its ID
export async function getBookById(req, res) {
    try {
        const { id } = req.params;
        // Find the book and bring the category name as well
        const book = await Book.findById(id).populate('category');

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        res.status(200).json({ success: true, book });
    } catch (err) {
        console.error("Error in getBookById:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const normalizeCover = (coverImage, isbn) => {
    const safeIsbn = String(isbn || "").trim();
    let url = typeof coverImage === "string" ? coverImage.trim() : "";

    const fallback = safeIsbn
        ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(safeIsbn)}-L.jpg`
        : "";

    if (!url) return fallback;

    url = url.replace(/^http:\/\//i, "https://");

    if (url.includes("books.google.com/books/content")) {
        return fallback;
    }

    return url;
};

export async function addByIsbn(req, res) {
    try {
        const { isbn, name, author, coverImage, length, categoryName } = req.body;

        if (!isbn || !name || !author) {
            return res
                .status(400)
                .json({ success: false, message: "isbn, name and author are required" });
        }

        // 1) Dup check
        const existingBook = await Book.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(String(name))}$`, "i") },
            author: { $regex: new RegExp(`^${escapeRegex(String(author))}$`, "i") },
        });

        if (existingBook) {
            return res.status(409).json({
                success: false,
                message: "Book already exists",
                bookId: existingBook._id,
            });
        }

        // 2) Category
        const safeCategoryName = (categoryName && String(categoryName).trim()) || "General";

        let category = await Category.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(safeCategoryName)}$`, "i") },
        });

        if (!category) {
            category = await Category.create({ name: safeCategoryName });
        }

        // 3) Normalize fields
        const normalizedLength =
            typeof length === "number"
                ? length
                : parseInt(String(length).match(/\d+/)?.[0] || "0", 10);

        const finalCover = normalizeCover(coverImage, isbn);

        // 4) Create
        const newBook = await Book.create({
            isbn: String(isbn).trim(),
            name: String(name).trim(),
            author: String(author).trim(),
            coverImage: finalCover,
            length: normalizedLength,
            category: category._id,
            isUserAdded: true,
        });

        return res.status(201).json({ success: true, book: newBook });
    } catch (err) {
        console.error("Critical Backend Error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}


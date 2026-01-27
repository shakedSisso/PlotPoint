import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import { CreateShelves, CreateBookInShelf } from "../validations/create.schema.js";
import { deleteShelfAfterClear } from "../services/shelf.service.js";


export async function createShelf(req, res) {
    try {
        const payload = { ...req.body, userID: req.user.id };
        const data = CreateShelves.parse(payload);

        const shelf = await Shelf.create({
            name: data.name,
            status: data.status,
            isPrivate: data.isPrivate,
            userId: req.user.id 
        });

        res.status(201).json({ success: true, shelf });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getAllShelves(req, res) {
    try {
        const shelves = await Shelf.find().populate('status');
        res.status(200).json({ success: true, shelves });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function addBookToShelf(req, res) {
    try {
        const data = CreateBookInShelf.parse(req.body);

        const shelf = await Shelf.findOne({ 
            _id: data.shelfID, 
            userId: req.user.id 
        });

        if (!shelf) {
            // If the shelf doesn't exist OR it belongs to someone else, we return 404
            return res.status(404).json({ success: false, error: "Shelf not found" });
        }

        const newEntry = await BookInShelf.create({
            bookId: data.bookID,
            shelfId: data.shelfID,
            progress: data.progress
        });

        res.status(201).json({ success: true, entry: newEntry });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        if (err.code === 11000) { // Handle duplicate entry error
            return res.status(409).json({ success: false, error: "This book is already on this shelf" });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getBooksFromShelf(req, res) {
    try {
        const { shelfName } = req.params;

        const shelf = await Shelf.findOne({ 
            name: shelfName, 
            userId: req.user.id
        });

        if (!shelf) {
            return res.status(404).json({ success: false, error: "Shelf not found" });
        }

        const books = await BookInShelf.find({ shelfId: shelf._id })
            .populate('bookId')
            .populate('shelfId');

        res.status(200).json({ success: true, books });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function removeBookFromShelf(req, res) {
    try {
        const { shelfId, bookId } = req.params;

        const deleted = await BookInShelf.findOneAndDelete({
            shelfId,
            bookId
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: "Book not found in this shelf"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Book removed from shelf"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function deleteShelf(req, res) {
  try {
    const { shelfId } = req.params;

    // Check if shelf has books
    const booksCount = await BookInShelf.countDocuments({ shelfId });
    if (booksCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Shelf must be empty before deletion"
      });
    }

    const deleted = await Shelf.findByIdAndDelete(shelfId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Shelf not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shelf deleted successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

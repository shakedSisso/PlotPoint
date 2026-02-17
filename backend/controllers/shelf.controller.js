import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import Status from "../models/status.model.js";
import { CreateShelves, CreateBookInShelf } from "../validations/create.schema.js";

/**
 * Creates a new personal shelf for the user.
 * Attributes include name, visibility (private/public), and reading status.
 */
export async function createShelf(req, res) {
    try {
        // Prepare payload by attaching the authenticated user's ID
        const payload = { ...req.body, userID: req.user.id };
        const userCreatedStatus = await Status.findOne({ description: "User Created" });

        if (!userCreatedStatus) {
            return res.status(500).json({
                success: false,
                error: "Status not found in database"
            });
        }

        payload.status = userCreatedStatus._id.toString();
        const data = CreateShelves.parse(payload);

        const shelf = await Shelf.create({
            name: data.name,
            status: data.status,
            isPrivate: data.isPrivate,
            userId: req.user.id
        });

        res.status(201).json({ success: true, shelf });

    } catch (err) {
        // Catch and format Zod validation errors for the client
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

/**
 * Retrieves every shelf in the system.
 * Populates the 'status' reference field for complete data.
 */
export async function getAllShelves(req, res) {
    try {
        // 1. Fetch user's shelves and use .lean() to allow modifying the result object
        const shelves = await Shelf.find({ userId: req.user.id }).lean();

        // 2. Fetch up to 3 books for each shelf to serve as a preview
        const shelvesWithBooks = await Promise.all(shelves.map(async (shelf) => {
            const booksInShelf = await BookInShelf.find({ shelfId: shelf._id })
                .populate('bookId', 'name author') // Only bring the name and author
                .limit(3) // Get max 3 books for the preview
                .lean();

            return {
                ...shelf,
                previewBooks: booksInShelf.map(entry => entry.bookId) // Extract just the book details
            };
        }));

        res.status(200).json({ success: true, shelves: shelvesWithBooks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

/**
 * Links a book to a specific shelf.
 * Includes a security check to ensure the shelf belongs to the requester.
 */
export async function addBookToShelf(req, res) {
    try {
        const data = CreateBookInShelf.parse(req.body);

        // Verify shelf ownership before allowing the book addition
        const shelf = await Shelf.findOne({
            _id: data.shelfID,
            userId: req.user.id
        });

        if (!shelf) {
            // Return 404 even if it exists but belongs to another user (security by obscurity)
            return res.status(404).json({ success: false, error: "Shelf not found" });
        }

        // Create the pivot record between book and shelf
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
        // Handle MongoDB unique constraint errors (e.g., book already on shelf)
        if (err.code === 11000) {
            return res.status(409).json({ success: false, error: "This book is already on this shelf" });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

/**
 * Fetches all books associated with a shelf, identified by its name.
 * Populates full book details for the response.
 */
export async function getBooksFromShelf(req, res) {
    try {
        const { shelfName } = req.params;

        // Find the shelf by name and owner
        const shelf = await Shelf.findOne({
            name: shelfName,
            userId: req.user.id
        });

        if (!shelf) {
            return res.status(404).json({ success: false, error: "Shelf not found" });
        }

        // Retrieve all entries for this shelf and populate related data
        const books = await BookInShelf.find({ shelfId: shelf._id })
            .populate('bookId')
            .populate('shelfId');

        res.status(200).json({ success: true, books });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

/**
 * Removes a book entry from a specific shelf.
 * Validates that the user owns the shelf before deletion.
 */
export async function removeBookFromShelf(req, res) {
    try {
        const { shelfId, bookId } = req.params;

        // Ensure user owns the shelf
        const shelf = await Shelf.findOne({ _id: shelfId, userId: req.user.id });
        if (!shelf) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized: You do not own this shelf"
            });
        }

        // Remove the specific book-to-shelf connection
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

/**
 * Deletes an entire shelf.
 * Includes a safety check: the shelf must be empty before it can be deleted.
 */
export async function deleteShelf(req, res) {
    try {
        const { shelfId } = req.params;

        // Ownership verification
        const shelf = await Shelf.findOne({ _id: shelfId, userId: req.user.id });
        if (!shelf) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized: You do not own this shelf"
            });
        }

        // Prevent deletion if the shelf still contains books (Referential integrity check)
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

/**
 * Updates shelf properties (like name or privacy).
 * Limits updates to the owner of the shelf.
 */
export async function updateShelf(req, res) {
    try {
        const { shelfId } = req.params;
        // Perform update only if owner matches
        const shelf = await Shelf.findOneAndUpdate(
            { _id: shelfId, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!shelf) return res.status(404).json({ success: false, error: "Shelf not found" });
        res.status(200).json({ success: true, shelf });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}
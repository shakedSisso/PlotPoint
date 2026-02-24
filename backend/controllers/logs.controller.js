import { Log } from "../models/logs.model.js";
import { Review } from "../models/review.model.js";
import { Book } from "../models/book.model.js"; 


import { CreateLogs, CreateReviews } from "../validations/create.schema.js"

//Records a new reading progress log for a user.
//Captures current page and optional notes.
export async function LogsProgress(req, res) {
    try {
        // Merge user ID into payload for Zod validation
        const payload = { ...req.body, userId: req.user.id };
        const data = CreateLogs.parse(payload);

        // Save the progress entry to the database
        const log = await Log.create({
            userId: req.user.id,
            bookId: data.bookId,
            currentPage: data.currentPage,
            note: data.note
        });
        res.status(201).json({ success: true, log });
    }
    catch (err) {
        // Handle validation errors from Zod
        if (err.name === 'ZodError') {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

//Retrieves all reading logs for a specific book associated with the logged-in user.
//Results are sorted by most recent first.
export async function GetBookLogs(req, res) {
    try {
        const { bookId } = req.query;
        // Query logs matching both user and book constraints
        const logs = await Log.find({ userId: req.user.id, bookId }).sort({ createdAt: -1 }); res.status(200).json({ success: true, logs });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

//Creates a book review.
//Enforces a one-review-per-book policy for each user.
export async function ReviewCreate(req, res) {
    try {
        const payload = { ...req.body, userId: req.user.id };
        const data = CreateReviews.parse(payload);

        const existingReview = await Review.findOne({
            userId: data.userId,
            bookId: data.bookId
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                error: "You have already reviewed this book."
            });
        }

        const review = await Review.create({
            userId: data.userId,
            bookId: data.bookId,
            rating: data.rating,
            text: data.text
        });

        res.status(201).json({ success: true, review });
    }
    catch (err) {
        if (err.name === 'ZodError' && Array.isArray(err.errors)) {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }

        console.error("ReviewCreate Error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

//Retrieves all reviews for a specific book.
//Populates reviewer details (name, username) and sorts by newest.

export async function GetBookReviews(req, res) {
    try {
        const { bookId } = req.params;
        const reviews = await Review.find({ bookId })
            .populate('userId', 'name username') // Joins User data
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getMyReview(req, res) {
    try {
        const { bookId } = req.params;
        const review = await Review.findOne({
            bookId: bookId,
            userId: req.user.id
        });

        res.status(200).json({ success: true, review: review || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}


//Updates an existing reading log.
//Ensures the log exists and belongs to the requesting user.
export async function updateLog(req, res) {
    try {
        const { logId } = req.params;
        // Atomic update: finds by ID and ownership, then applies body changes
        const log = await Log.findOneAndUpdate(
            { _id: logId, userId: req.user.id },
            req.body,
            { new: true } // Returns the modified document
        );
        if (!log) return res.status(404).json({ success: false, error: "Log not found" });
        res.status(200).json({ success: true, log });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}


//Updates an existing book review.
//Restricts updates to the original reviewer.
export async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const review = await Review.findOneAndUpdate(
            { _id: reviewId, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!review) return res.status(404).json({ success: false, error: "Review not found" });
        res.status(200).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}


export async function getMyProgress(req, res) {
  try {
    const { bookId } = req.params;

    // 1) bring total pages from Book
    const book = await Book.findById(bookId).select("length").lean();
    if (!book) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    const totalPages = Number(book.length) || 0;
    if (totalPages <= 0) {
      return res.status(200).json({
        success: true,
        totalPages,
        currentPage: 0,
        progressPercent: 0,
        lastUpdatedAt: null,
      });
    }

    // 2) latest log for this user+book
    const latestLog = await Log.findOne({
      userId: req.user.id,
      bookId: bookId,
    })
      .sort({ createdAt: -1 })
      .select("currentPage createdAt")
      .lean();

    const currentPageRaw = Number(latestLog?.currentPage) || 0;
    const currentPage = Math.max(0, Math.min(currentPageRaw, totalPages));

    // 3) calculate percent
    const progressPercent = Math.round((currentPage / totalPages) * 100);

    return res.status(200).json({
      success: true,
      totalPages,
      currentPage,
      progressPercent,
      lastUpdatedAt: latestLog?.createdAt || null,
    });
  } catch (err) {
    console.error("getMyProgress error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
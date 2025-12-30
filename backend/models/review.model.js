import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
    },
    rating: {
        type: Number,
        required: true,
    },
    text: {
        type: String
    }
});

export const Review = mongoose.model('Review', reviewSchema);
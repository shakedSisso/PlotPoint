import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
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
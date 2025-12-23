import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
    },
    bookId: {
        type: ObjectId,
        required: true,
    },
    rating: {
        type: Int32,
        required: true,
    },
    text: {
        type: String
    }
});

export const Review = mongoose.model('Review', reviewSchema);
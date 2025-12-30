import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    progress: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
    },
});

export const Shelf = mongoose.model('Shelf', shelfSchema);

import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
    },
    progress: {
        type: Int32,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: true,
    },
});

export const Shelf = mongoose.model('Shelf', shelfSchema);

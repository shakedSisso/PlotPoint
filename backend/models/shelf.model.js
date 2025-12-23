import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
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

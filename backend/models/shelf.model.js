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
        type: ObjectId,
        required: true,
    },
    bookId: {
        type: ObjectId,
        required: true,
    },
});

export const Shelf = mongoose.model('Shelf', shelfSchema);

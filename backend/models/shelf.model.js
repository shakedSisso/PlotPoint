import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
    status: {
        type: Int32,
        required: true,
    },
    progress: {
        type: Int32,
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

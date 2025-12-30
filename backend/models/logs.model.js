import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
    },
    bookId: {
        type: ObjectId,
        required: true,
    },
    currentPage: {
        type: Number,
        required: true,
    },
    note: {
        type: String
    }
});

export const Log = mongoose.model('Log', logSchema);
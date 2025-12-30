import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
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
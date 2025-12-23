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
        type: Int32,
        required: true,
    },
    note: {
        type: String
    }
});

export const Log = mongoose.model('Log', logSchema);
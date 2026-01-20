import mongoose from "mongoose";

const buddyRead = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
    }
});

export const BuddyRead = mongoose.model('BuddyRead', buddyRead);
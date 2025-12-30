import mongoose from "mongoose";

const buddyRead = new mongoose.Schema({
    shelfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shelf",
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
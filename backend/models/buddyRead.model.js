import mongoose from "mongoose";

const buddyRead = new mongoose.Schema({
    shelfId: {
        type: ObjectId,
        required: true
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
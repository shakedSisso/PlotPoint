import mongoose from "mongoose";

const buddyRead = new mongoose.Schema({
    bookInShelf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookInShelf",
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
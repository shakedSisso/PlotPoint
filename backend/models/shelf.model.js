import mongoose from "mongoose";

const shelfSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPrivate: {
        type: Boolean
    }
});

export const Shelf = mongoose.model('Shelf', shelfSchema);

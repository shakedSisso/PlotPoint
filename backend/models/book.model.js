import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    isUserAdded: {
        type: Boolean,
        required: true,
        default: false,
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: false,
    }
});

export const Book = mongoose.model('Book', bookSchema);

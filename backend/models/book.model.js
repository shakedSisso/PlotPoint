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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        // required: true,
    },
    isUserAdded: {
        type: Boolean,
        required: true,
    },
    isPrivate: {
        type: Boolean,
        required: true,
    }
});

export const Book = mongoose.model('Book', bookSchema);

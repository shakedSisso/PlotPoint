import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    length: {
        type: Int32,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
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

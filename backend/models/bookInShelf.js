import mongoose from "mongoose";

const bookInShelfSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    shelfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelf',
        required: true
    },
    progress: {
        type: Number,
        default: 0
    }
});

export const BookInShelf = mongoose.model('BookInShelf', bookInShelfSchema);

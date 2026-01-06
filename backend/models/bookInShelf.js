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
        required: true,
        default: 0
    }
});

bookInShelfSchema.index({ shelfId: 1, bookId: 1 }, { unique: true });

export const BookInShelf = mongoose.model('BookInShelf', bookInShelfSchema);

import { BuddyRead } from "../models/buddyRead.model.js";
import { BuddyReadSharing } from "../models/buddyReadSharing.model.js";
import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import { CreateBuddyRead, CreateBuddyReadSharing } from '../validations/create.schema.js';

export async function buddyReadCreation(req, res) {
    try {
        const data = CreateBuddyRead.parse(req.body);

        const existingRead = await BuddyRead.findOne({ bookInShelf: data.bookInShelf });
        if (existingRead)
            return res.status(409).json({ success: false, error: "Buddy read already active for this book" });

        const bookEntry = await BookInShelf.findById(data.bookInShelf).populate('shelfId');
        if (!bookEntry || bookEntry.shelfId.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: "You can only start a buddy read for books in your own shelf" });
        }

        const buddyRead = await BuddyRead.create({
            bookInShelf: data.bookInShelf,
            startDate: data.startDate || new Date(),
            endDate: null
        });

        res.status(201).json({ success: true, buddyRead });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function shareBuddyRead(req, res) {
    try {
        const data = CreateBuddyReadSharing.parse(req.body);
        const { id: buddyReadId } = req.params;

        const buddyReadExists = await BuddyRead.findById(buddyReadId);
        if (!buddyReadExists) {
            return res.status(404).json({ success: false, error: "Buddy Read session not found" });
        }

        const share = await BuddyReadSharing.create({
            buddyReadId: buddyReadId,
            userIdShared: data.userIdShared
        });

        res.status(201).json({ success: true, share });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getMyBuddyReads(req, res) {
    try {
        const userId = req.user.id;

        const sharedEntries = await BuddyReadSharing.find({
            userIdShared: userId
        });
        const sharedBuddyReadIds = sharedEntries.map(entry => entry.buddyReadId);

        const myShelves = await Shelf.find({ userId: userId }).select('_id');
        const myShelfIds = myShelves.map(shelf => shelf._id);

        const booksInMyShelves = await BookInShelf.find({
            shelfId: { $in: myShelfIds }
        }).select('_id');
        const myBookInShelfIds = booksInMyShelves.map(b => b._id);

        const buddyReads = await BuddyRead.find({
            $or: [
                { _id: { $in: sharedBuddyReadIds } },
                { bookInShelf: { $in: myBookInShelfIds } }
            ]
        }).populate({
            path: 'bookInShelf',
            populate: [
                { path: 'bookId' },
                { path: 'shelfId' }
            ]
        });

        res.status(200).json({ success: true, buddyReads });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function endBuddyRead(req, res) {
    try {
        const { id } = req.params;
        const buddyRead = await BuddyRead.findOneAndUpdate(
            { _id: id },
            { endDate: new Date() },
            { new: true }
        );
        if (!buddyRead) return res.status(404).json({ success: false, error: "Buddy read not found" });
        res.status(200).json({ success: true, buddyRead });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function deleteBuddyRead(req, res) {
    try {
        const { id } = req.params;

        const buddyRead = await BuddyRead.findByIdAndDelete(id);
        
        if (!buddyRead) {
            return res.status(404).json({ success: false, error: "Buddy Read not found" });
        }

        await BuddyReadSharing.deleteMany({ buddyReadId: id });

        res.status(200).json({ success: true, message: "Buddy Read and all shares deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function removeSharing(req, res) {
    try {
        const { shareId } = req.params;

        const share = await BuddyReadSharing.findByIdAndDelete(shareId);
        if (!share) {
            return res.status(404).json({ success: false, error: "Sharing record not found" });
        }

        res.status(200).json({ success: true, message: "User removed from buddy read" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
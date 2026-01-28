import { BuddyRead } from "../models/buddyRead.model.js";
import { BuddyReadSharing } from "../models/buddyReadSharing.model.js";
import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import { CreateBuddyRead, CreateBuddyReadSharing } from '../validations/create.schema.js';

export async function buddyReadCreation(req, res) {
    try {
        const data = CreateBuddyRead.parse(req.body);

        const existingRead = await BuddyRead.findOne({ bookId: data.bookId });
        if (existingRead)
            return res.status(409).json({ success: false, error: "Buddy read already active for this book" });

        const buddyRead = await BuddyRead.create({
            bookId: data.bookId,
            startDate: new Date(),
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
            userIdShared: userId.toString()
        });
        const sharedBuddyReadIds = sharedEntries.map(entry => entry.buddyReadId);

        const myShelves = await Shelf.find({ userId: userId }).select('_id');
        const myShelfIds = myShelves.map(shelf => shelf._id);

        const booksInMyShelves = await BookInShelf.find({
            shelfId: { $in: myShelfIds }
        }).select('bookId');

        const myBookIds = booksInMyShelves.map(b => b.bookId);


        const buddyReads = await BuddyRead.find({
            $or: [
                { _id: { $in: sharedBuddyReadIds } },
                { bookId: { $in: myBookIds } }
            ]
        }).populate('bookId');

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
            { _id: id, createdBy: req.user.id },
            { endDate: new Date() },
            { new: true }
        );
        if (!buddyRead) return res.status(404).json({ success: false, error: "Buddy read not found or unauthorized" });
        res.status(200).json({ success: true, buddyRead });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function deleteBuddyRead(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const buddyRead = await BuddyRead.findOne({ _id: id, createdBy: userId });
        
        if (!buddyRead) {
            return res.status(403).json({ success: false, error: "Unauthorized or Buddy Read not found" });
        }

        await BuddyRead.findByIdAndDelete(id);

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
        const userId = req.user.id;

        const share = await BuddyReadSharing.findById(shareId).populate('buddyReadId');
        if (!share) {
            return res.status(404).json({ success: false, error: "Sharing record not found" });
        }

        const isCreator = share.buddyReadId.createdBy.toString() === userId;
        const isSharedUser = share.userIdShared.toString() === userId;

        if (isCreator || isSharedUser) {
            await BuddyReadSharing.findByIdAndDelete(shareId);
            return res.status(200).json({ success: true, message: "User removed from buddy read" });
        }

        res.status(403).json({ success: false, error: "Unauthorized" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
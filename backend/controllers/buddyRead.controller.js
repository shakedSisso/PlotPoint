import { BuddyRead } from "../models/buddyRead.model.js";
import { BuddyReadSharing } from "../models/buddyReadSharing.model.js";
import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import { CreateBuddyRead, CreateBuddyReadSharing } from '../validations/create.schema.js';


//Initializes a new Buddy Read session for a specific book.
//Checks for existing active sessions before creation.
export async function buddyReadCreation(req, res) {
    try {
        // Validate request body against Zod schema
        const data = CreateBuddyRead.parse(req.body);

        // Prevent duplicate active sessions for the same book
        const existingRead = await BuddyRead.findOne({ bookId: data.bookId });
        if (existingRead)
            return res.status(409).json({ success: false, error: "Buddy read already active for this book" });

        // Create the record with the current timestamp as start date
        const buddyRead = await BuddyRead.create({
            bookId: data.bookId,
            startDate: new Date(),
            endDate: null
        });

        res.status(201).json({ success: true, buddyRead });

    } catch (err) {
        // Handle Zod validation formatting errors
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}


 //Shares an existing Buddy Read session with another user.
export async function shareBuddyRead(req, res) {
    try {
        // Validate shared user ID
        const data = CreateBuddyReadSharing.parse(req.body);
        const { id: buddyReadId } = req.params;

        // Verify the Buddy Read session exists before attempting to share
        const buddyReadExists = await BuddyRead.findById(buddyReadId);
        if (!buddyReadExists) {
            return res.status(404).json({ success: false, error: "Buddy Read session not found" });
        }

        // Create the sharing relationship record
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

//Retrieves all Buddy Reads relevant to the authenticated user.
// Includes sessions shared with them AND sessions for books currently in their shelves.
export async function getMyBuddyReads(req, res) {
    try {
        const userId = req.user.id;

        // 1. Get IDs of Buddy Reads shared directly with the user
        const sharedEntries = await BuddyReadSharing.find({
            userIdShared: userId.toString()
        });
        const sharedBuddyReadIds = sharedEntries.map(entry => entry.buddyReadId);

        // 2. Find all shelves belonging to the user
        const myShelves = await Shelf.find({ userId: userId }).select('_id');
        const myShelfIds = myShelves.map(shelf => shelf._id);

        // 3. Find all book IDs contained within those shelves
        const booksInMyShelves = await BookInShelf.find({
            shelfId: { $in: myShelfIds }
        }).select('bookId');

        const myBookIds = booksInMyShelves.map(b => b.bookId);

        // 4. Query Buddy Reads that match either the shared IDs or the user's books
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

 //Marks a Buddy Read session as finished by setting an end date.
 //Restricts action to the creator of the session.
 
export async function endBuddyRead(req, res) {
    try {
        const { id } = req.params;
        // Update only if the record exists and belongs to the requester
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

 // Permanently deletes a Buddy Read session and all associated shares.
 // Restricts action to the creator.
export async function deleteBuddyRead(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check ownership before deletion
        const buddyRead = await BuddyRead.findOne({ _id: id, createdBy: userId });
        
        if (!buddyRead) {
            return res.status(403).json({ success: false, error: "Unauthorized or Buddy Read not found" });
        }

        // Remove the main session record
        await BuddyRead.findByIdAndDelete(id);

        // Cascade delete: remove all sharing records linked to this session
        await BuddyReadSharing.deleteMany({ buddyReadId: id });

        res.status(200).json({ success: true, message: "Buddy Read and all shares deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}


 //Removes a specific user from a Buddy Read session.
 //Allowed if the requester is either the creator of the session or the shared user themselves.
export async function removeSharing(req, res) {
    try {
        const { shareId } = req.params;
        const userId = req.user.id;

        // Fetch share record and populate parent session to check creator ID
        const share = await BuddyReadSharing.findById(shareId).populate('buddyReadId');
        if (!share) {
            return res.status(404).json({ success: false, error: "Sharing record not found" });
        }

        const isCreator = share.buddyReadId.createdBy.toString() === userId;
        const isSharedUser = share.userIdShared.toString() === userId;

        // Authorization check: Only involved parties can remove a share
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
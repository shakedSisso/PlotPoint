import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Shelf } from "../models/shelf.model.js";
import { BuddyRead } from "../models/buddyRead.model.js";
import { BuddyReadSharing } from "../models/buddyReadSharing.model.js";
import { deleteShelfAfterClear } from "../services/shelf.service.js";
import { DeleteUser } from "../validations/delete.schema.js"


export async function getUsers(req, res) {
  try {
    const users = await User.find({}, "-password -isAdmin -createdAt -updatedAt");
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}


export async function deleteUser(req, res) {
  try {
    const { userId } = DeleteUser.parse(req.params);

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    if (err.name === "ZodError") {
      const errors = err.issues.map(e => `${e.path.join(".")}: ${e.message}`);
      return res.status(400).json({ success: false, errors });
    }

    console.log(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

export async function deleteMe(req, res) {
  const userId = req.user.id;

  // Start a MongoDB session for atomic (transactional) deletion
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Find all shelves created by the user
    const myShelves = await Shelf.find({ userId }).select("_id").session(session);

    // 2) For each shelf:
    //    - Remove all books from the shelf
    //    - Delete the shelf itself
    for (const shelf of myShelves) {
      await deleteShelfAfterClear(shelf._id, session);
    }

    // 3) Delete BuddyRead shares where user is the recipient
    await BuddyReadSharing.deleteMany({ userIdShared: userId }).session(session);

    // 4) Delete BuddyReads created by this user and their associated shares
    const myBuddyReads = await BuddyRead.find({ createdBy: userId }).session(session);
    const myBuddyReadIds = myBuddyReads.map(br => br._id);

    await BuddyReadSharing.deleteMany({ buddyReadId: { $in: myBuddyReadIds } }).session(session);
    await BuddyRead.deleteMany({ createdBy: userId }).session(session);

    // 5) Delete the user account
    const deleted = await User.findByIdAndDelete(userId).session(session);
    if (!deleted) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Commit the transaction if everything succeeded
    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (err) {
    // Roll back all changes if any step fails
    await session.abortTransaction();
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  } finally {
    // End the MongoDB session
    session.endSession();
  }
}

export async function updateProfile(req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name: req.body.name, username: req.body.username },
            { new: true }
        ).select("-password");
        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
}
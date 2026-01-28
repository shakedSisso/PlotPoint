import mongoose from "mongoose";

const buddyReadSharing = new mongoose.Schema({
    buddyReadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BuddyRead",
        required: true
    },
    userIdShared: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export const BuddyReadSharing = mongoose.model('BuddyReadSharing' , buddyReadSharing);
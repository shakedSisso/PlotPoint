import mongoose from "mongoose";

const buddyReadSharing = new mongoose.Schema({
    buddyReadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BuddyRead",
        required: true
    },
    userIdShared: {
        type:String,
    }
});

export const BuddyReadSharing = mongoose.model('BuddyReadSharing' , buddyReadSharing);
import mongoose from "mongoose";

const buddyReadSharing = new mongoose.Schema({
    buddyReadId: {
        type: String,
        required: true
    },
    userIdShared: {
        type:String,
    }
});

export const BuddyReadSharing = mongoose.model('BuddyReadSharing' , buddyReadSharing);
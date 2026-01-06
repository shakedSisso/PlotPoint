import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    decpription: {
        type: String
    }
});

export const Status = mongoose.model('Status' , statusSchema);
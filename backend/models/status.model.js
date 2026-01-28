import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    description: {
        type: String
    }
});

export const Status = mongoose.model('Status' , statusSchema);
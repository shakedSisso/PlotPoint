import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    decpription: {
        type: String
    }
});

export const Status = mongoose.model('Status' , statusSchema);
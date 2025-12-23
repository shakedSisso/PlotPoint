import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    id:{
        type: Int32,
        required: true,
        unique: true
    },
    decpription: {
        type: String
    }
});

export const Status = mongoose.model('Status' , statusSchema);
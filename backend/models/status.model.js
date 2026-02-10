import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    description: {
        type: String
    }
});

const Status = mongoose.model('Status' , statusSchema);
export default Status;
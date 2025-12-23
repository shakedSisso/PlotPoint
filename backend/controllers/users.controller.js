import { User } from "../models/user.model.js";

export async function getUsers(req, res) {
    try {
        const users = await User.find({}, "-password -isAdmin -createdAt -updatedAt"); 
        res.status(200).json({ success: true, users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
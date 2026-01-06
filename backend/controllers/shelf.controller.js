import { Shelf } from "../models/shelf.model.js";
import { Status } from "../models/status.model.js";
import { CreateShelves } from "../validations/create.schema.js";

export async function createShelf(req, res) {
    try {
        const data = CreateShelves.parse(req.body);

        const shelf = await Shelf.create({
            name: data.name,
            status: data.status,
            isPrivate: data.isPrivate,
            userId: data.userID 
        });

        res.status(201).json({ success: true, shelf });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getAllShelves(req, res) {
    try {
        const shelves = await Shelf.find().populate('status');
        res.status(200).json({ success: true, shelves });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

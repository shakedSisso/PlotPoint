import { Shelf } from "../models/shelf.model.js";
import { Status } from "../models/status.model.js";
import { BookInShelf } from "../models/bookInShelf.js";
import { CreateShelves, CreateBookInShelf } from "../validations/create.schema.js";

import mongoose from "mongoose";

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

export async function addBookToShelf(req, res) {
    try {
        const data = CreateBookInShelf.parse(req.body);

        const newEntry = await BookInShelf.create({
            bookId: data.bookID,
            shelfId: data.shelfID,
            progress: data.progress
        });

        res.status(201).json({ success: true, entry: newEntry });

    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        // Handle duplicate entry error (MongoDB code 11000)
        if (err.code === 11000) {
            return res.status(409).json({ success: false, error: "This book is already on this shelf" });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function getBooksFromShelf(req, res) {
    try {
        const { shelfName } = req.params;

        const shelf = await Shelf.findOne({ 
            name: shelfName, 
            userId: new mongoose.Types.ObjectId("694a530ab0e7ef645b442796") //req.user.id 
        });

        if (!shelf) {
            return res.status(404).json({ success: false, error: "Shelf not found" });
        }

        const books = await BookInShelf.find({ shelfId: shelf._id })
            .populate('bookId')
            .populate('shelfId');

        res.status(200).json({ success: true, books });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
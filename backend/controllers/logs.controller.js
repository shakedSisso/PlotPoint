import { Log } from "../models/logs.model.js";
import { Review } from "../models/review.model.js"

import { CreateLogs, CreateReviews } from "../validations/create.schema.js"

export async function LogsProgress(req, res) {
    try{
        const data = CreateLogs.parse(req.body);
        const log = await Log.create({
            userID: req.body.userID,
            bookID: data.bookID,
            currentPage: data.currentPage,
            note: data.note
        });
        res.status(201).json({success:true, log});
    }
    catch(err)
    {
        if(err.name === 'ZodError'){
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function GetBookLogs(req, res) {
    try{
        const { userID, bookID } = req.query;
        const logs = await Log.find({ userID, bookID }).sort({ createdAt: -1 });
        res.status(200).json({success: true, logs});
    }    
    catch(err){
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function ReviewCreate(req, res){
    try{
        const data = CreateReviews.parse(req.body);
        const existingReview = await Review.findOne({
            userID: req.body.userID, 
            bookID: data.bookID
        });
        if(existingReview)
        {
            return res.status(409).json({ 
                success: false, 
                error: "You have already reviewed this book. You can update your existing review instead." 
            });
        }
        const review = await Review.create({
            userID: req.body.userID,
            bookID: data.bookID,
            rating: data.rating,
            text: data.text
        });
        res.status(201).json({success: true, review});
    }
    catch(err){
        if(err.name === 'ZodError'){
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function GetBookReviews(req,res) {
    try{
        const { bookID } = req.params;
        const reviews = await Review.find({ bookID })
            .populate('userID', 'name username')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, reviews });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}
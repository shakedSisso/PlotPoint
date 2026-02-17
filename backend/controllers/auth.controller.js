import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { RegisterUser, LoginUser } from "../validations/auth.schema.js";
import { Shelf } from "../models/shelf.model.js";
import Status from "../models/status.model.js";

const setCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    res.cookie("token", token, {
        httpOnly: true, // Secure: client JS cannot read it
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

export async function register(req, res) {
    try {
        const data = RegisterUser.parse(req.body);
        const emailExists = await User.findOne({ email: data.email }); //find if there is any user with that email
        if (emailExists)
            return res.status(409).json({ success: false, error: "Email already in use" });

        const usernameExists = await User.findOne({ username: data.username }); //find if there is any user with that email
        if (usernameExists)
            return res.status(409).json({ success: false, error: "username already in use" });

        const hash = await bcrypt.hash(data.password, 15); //15 rounds = 32,768 iterations
        // $2b$ - the bcrypt id, 15 - rounds of hashing (2^rounds), $ - separation, 22 chars salt (base64)
        const user = await User.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: hash,
            isAdmin: false
        });

        // --- Start of automatic shelf creation ---

        // Fetch all statuses except for "USERCREATER"
        const defaultStatuses = await Status.find({ description: { $ne: "USERCREATER" } });

        // Create an array of shelf objects, one for each found status
        const shelvesToCreate = defaultStatuses.map((status) => ({
            name: status.description, // Shelf name will match the status description
            status: status._id,       // Link to the status ID
            userId: user._id,         // Assign to the newly created user
            isPrivate: false          // Set shelves to public by default
        }));

        // Save all shelves to the database in a single operation
        if (shelvesToCreate.length > 0) {
            await Shelf.insertMany(shelvesToCreate);
        }

        // --- End of automatic shelf creation ---

        setCookie(res, user._id);

        const { password, isAdmin, ...safeUser } = user.toObject(); // to send the user it's data without the hashed password
        res.status(201).json({ success: true, user: safeUser });
    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
}

export async function login(req, res) {
    try {
        const data = LoginUser.parse(req.body);
        const user = await User.findOne({ email: data.email });
        if (!user)
            return res.status(401).json({ success: false, error: "Login failed" });

        const ok = await bcrypt.compare(data.password, user.password);
        if (!ok)
            return res.status(401).json({ success: false, error: "Login failed" });

        setCookie(res, user._id);

        const { password, isAdmin, ...safeUser } = user.toObject();  // to send the user it's data without the hashed password
        res.status(200).json({ success: true, user: safeUser });
    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors });
        }
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

export function logout(req, res) {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

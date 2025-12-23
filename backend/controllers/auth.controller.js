import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { RegisterUser, LoginUser } from "../validations/auth.schema.js";

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

        const { password, isAdmin, ...safeUser } = user.toObject(); // to send the user it's data without the hashed password
        res.status(201).json({ success: true, user: safeUser });
    } catch (err) {
        if (err.name === "ZodError") {
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors});
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

        const { password, isAdmin, ...safeUser } = user.toObject();  // to send the user it's data without the hashed password
        res.status(200).json({ success: true, user: safeUser });
    } catch (err) {
        if (err.name === "ZodError"){
            const errors = JSON.parse(err.message).map(e => e.message);
            return res.status(400).json({ success: false, errors});
        }
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

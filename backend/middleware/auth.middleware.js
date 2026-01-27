import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, error: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds id to the request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
};

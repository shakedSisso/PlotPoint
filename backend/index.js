import express from "express";
import { connectDB } from "./lib/connect.js";
import routes from "./routes/index.js";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;
const CLIENT_PORT = 5173;

app.use(cors({
    origin: `http://localhost:${CLIENT_PORT}`,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api", routes); //connect all the routes from routes/index.js to the path 'api'

app.use((req, res) =>
    res.status(404).json({ success: false, error: "Page not found" })
);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    connectDB();
});
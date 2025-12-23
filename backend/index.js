import express from "express";
import { connectDB } from "./lib/connect.js";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());
app.use("/api", routes); //connect all the routes from routes/index.js to the path 'api'

app.use((req, res) =>
    res.status(404).json({ success: false, error: "Page not found" })
);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    connectDB();
});
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import pollRouter from "./routes/pollRoutes.js";
import commentRouter from "./routes/commentRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notifications", notificationRouter);
app.use( '/api/v1/poll', pollRouter);
app.use('/api/v1/comment',commentRouter);

app.get("/", (req, res) => {
    res.send("API IS WORKING");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
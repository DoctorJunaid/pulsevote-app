// ==================== MAIN EXPRESS SERVER ENTRY POINT (server.js) ====================
// Initializes the Express application server, configures global middleware (CORS, body parsing),
// establishes connection to the MongoDB database, and registers all API v1 modular routers.

import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import pollRouter from "./routes/pollRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import userRouter from "./routes/userRoutes.js";

const PORT = process.env.PORT || 5000;
const app = express();

// ==================== GLOBAL MIDDLEWARE ====================
// 1. CORS: Enables Cross-Origin Resource Sharing for frontend client access
app.use(cors());

// 2. JSON Parser: Automatically parses incoming JSON payload request bodies
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
// Establishes connection to MongoDB via Mongoose
connectDB();

// ==================== ROUTE REGISTRATION (API V1) ====================
// 1. Authentication & Account Management Routes
app.use("/api/v1/auth", authRoutes);

// 2. Real-time User Activity & Notification Routes
app.use("/api/v1/notifications", notificationRouter);

// 3. Poll Creation, Discovery, Voting & Analytics Routes
app.use("/api/v1/poll", pollRouter);

// 4. Poll Discussion & Comment Thread Routes
app.use("/api/v1/comment", commentRouter);

// 5. User Profiles, Social Stats & Connection Routes
app.use("/api/v1/user", userRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("API IS WORKING");
});

// Start Express HTTP Server listener (only if not run as serverless on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB: ", err.message);
        console.error("Please check network connection and MongoDB Atlas IP Whitelist (0.0.0.0/0).");
    }
};
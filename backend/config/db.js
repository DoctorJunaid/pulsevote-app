import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("MONGO_URI environment variable is missing!");
            throw new Error("MONGO_URI environment variable is missing.");
        }

        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
            console.log("MongoDB connected successfully");
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        console.error("Error connecting to MongoDB: ", err.message);
        console.error("Please check network connection and MongoDB Atlas IP Whitelist (0.0.0.0/0).");
        throw err;
    }

    return cached.conn;
};
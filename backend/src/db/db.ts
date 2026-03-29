import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...", process.env.MONGODB_URI);
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}`, {});
        console.log("MongoDB connected: ", conn.connection.host);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

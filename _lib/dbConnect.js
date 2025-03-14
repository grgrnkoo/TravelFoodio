import mongoose from "mongoose";

const dbConnect = async () => {
    if (mongoose.connection.readyState) {
        console.log("Using existing database connection");
        return true;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increase timeout
        });
        console.log("✅ Database connected");

        mongoose.connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected. Reconnecting...");
            dbConnect();
        });

        return true;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        return false;
    }
};

export default dbConnect;

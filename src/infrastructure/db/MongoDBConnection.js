import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(String(process.env.MONGODB_URI));
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

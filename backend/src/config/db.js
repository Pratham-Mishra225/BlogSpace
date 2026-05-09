import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected gracefully.");
  } catch (error) {
    console.error(`MongoDB disconnect error: ${error.message}`);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost.");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

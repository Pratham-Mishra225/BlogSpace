import http from "node:http";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

const server = http.createServer(app);

const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`BlogSpace API listening on port ${env.PORT}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down BlogSpace API...`);

  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

startServer();

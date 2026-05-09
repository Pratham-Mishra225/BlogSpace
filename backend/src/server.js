import http from "node:http";
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

  // Force-exit after 10 s so lingering keep-alive connections never block shutdown.
  const forceExit = setTimeout(() => {
    console.warn("Graceful shutdown timed out — forcing exit.");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    await disconnectDB();
    clearTimeout(forceExit);
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

// MongoDB lifecycle events (connect/disconnect/reconnect) are managed in config/db.js.

startServer();

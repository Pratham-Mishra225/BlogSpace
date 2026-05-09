import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env, isProduction } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import draftRoutes from "./routes/draft.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Global middleware is defined here so server.js can stay focused on process lifecycle concerns.
app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.includes("*") ? "*" : corsOrigins,
    credentials: !corsOrigins.includes("*"),
  })
);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the BlogSpace API",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BlogSpace API running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

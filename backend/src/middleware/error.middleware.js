import { isProduction } from "../config/env.js";

export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  // Always log server-side errors; 5xx are unexpected and need visibility in production.
  if (statusCode >= 500) {
    console.error(`[${statusCode}] ${message}`, error.stack ?? "");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details && { details: error.details }),
    ...(!isProduction && { stack: error.stack }),
  });
};

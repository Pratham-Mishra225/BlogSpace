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

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0] ?? "field";
    return new ApiError(409, `${field} is already in use`, [
      {
        field,
        message: `${field} must be unique`,
      },
    ]);
  }

  if (error?.name === "ValidationError") {
    const details = Object.values(error.errors ?? {}).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));

    return new ApiError(400, "Validation failed", details);
  }

  if (error?.name === "CastError") {
    return new ApiError(400, "Invalid resource identifier", [
      {
        field: error.path,
        message: error.message,
      },
    ]);
  }

  return error;
};

export const errorHandler = (error, _req, res, _next) => {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;
  const message = normalizedError.message || "Internal server error";

  // Always log server-side errors; 5xx are unexpected and need visibility in production.
  if (statusCode >= 500) {
    console.error(`[${statusCode}] ${message}`, normalizedError.stack ?? "");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(normalizedError.details && { details: normalizedError.details }),
    ...(!isProduction && { stack: normalizedError.stack }),
  });
};

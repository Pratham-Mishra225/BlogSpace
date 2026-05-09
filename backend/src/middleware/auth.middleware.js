import { ApiError } from "./error.middleware.js";

export const requireAuth = (_req, _res, next) => {
  next(new ApiError(501, "Authentication middleware is not implemented yet"));
};

export const optionalAuth = (req, _res, next) => {
  req.user = null;
  next();
};

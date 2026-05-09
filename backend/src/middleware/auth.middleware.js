import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { ApiError, asyncHandler } from "./error.middleware.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.signedCookies?.accessToken ?? req.cookies?.accessToken ?? null;
};

const resolveAuthenticatedUser = async (req) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  if (decoded.type !== "access" || !decoded.sub) {
    throw new ApiError(401, "Invalid authentication token");
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists");
  }

  req.auth = decoded;
  req.user = user;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  await resolveAuthenticatedUser(req);
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  if (!getTokenFromRequest(req)) {
    req.user = null;
    req.auth = null;
    next();
    return;
  }

  await resolveAuthenticatedUser(req);
  next();
});

export const clearAuth = (req, _res, next) => {
  req.user = null;
  req.auth = null;
  next();
};

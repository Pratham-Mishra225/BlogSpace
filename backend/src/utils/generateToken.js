import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (payload, options = {}) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    ...options,
  });

export const generateAccessToken = (user) => {
  const userId = user?._id ?? user?.id ?? user;

  return generateToken({
    sub: userId.toString(),
    type: "access",
  });
};

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);

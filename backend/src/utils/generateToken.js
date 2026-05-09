import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (payload, options = {}) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    ...options,
  });

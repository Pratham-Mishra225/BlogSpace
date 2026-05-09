import { ApiError } from "../middleware/error.middleware.js";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { generateAccessToken } from "../utils/generateToken.js";

const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user.toJSON === "function") {
    return user.toJSON();
  }

  const safeUser = { ...user };
  const id = safeUser._id?.toString?.() ?? safeUser.id;
  delete safeUser.password;
  delete safeUser.__v;
  delete safeUser._id;

  return {
    id,
    ...safeUser,
  };
};

const buildAuthResponse = (user) => ({
  user: serializeUser(user),
  accessToken: generateAccessToken(user),
  tokenType: "Bearer",
  expiresIn: env.JWT_EXPIRES_IN,
});

export const authService = {
  async signup(payload) {
    const existingUser = await User.findOne({
      $or: [{ email: payload.email }, { username: payload.username }],
    }).select("email username");

    if (existingUser?.email === payload.email) {
      throw new ApiError(409, "Email is already registered");
    }

    if (existingUser?.username === payload.username) {
      throw new ApiError(409, "Username is already taken");
    }

    const user = await User.create(payload);
    return buildAuthResponse(user);
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return buildAuthResponse(user);
  },

  getCurrentUser(user) {
    return serializeUser(user);
  },
};

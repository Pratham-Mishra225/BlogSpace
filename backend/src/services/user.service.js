import { User } from "../models/User.js";

export const userService = {
  findByUsername(username) {
    return User.findOne({ username: username?.toLowerCase() });
  },
};

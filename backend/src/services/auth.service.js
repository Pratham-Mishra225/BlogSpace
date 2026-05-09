import { ApiError } from "../middleware/error.middleware.js";

export const authService = {
  notImplemented() {
    throw new ApiError(501, "Authentication service is intentionally not implemented yet");
  },
};

import { ApiError } from "../middleware/error.middleware.js";

export const userController = {
  placeholder() {
    throw new ApiError(501, "User endpoints are not implemented yet");
  },
};

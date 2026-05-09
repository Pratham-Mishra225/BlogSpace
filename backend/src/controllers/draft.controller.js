import { ApiError } from "../middleware/error.middleware.js";

export const draftController = {
  placeholder() {
    throw new ApiError(501, "Draft endpoints are not implemented yet");
  },
};

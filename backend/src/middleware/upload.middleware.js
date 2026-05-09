import multer from "multer";
import { ApiError } from "./error.middleware.js";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new ApiError(400, "Only image uploads are supported"));
  }

  return callback(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

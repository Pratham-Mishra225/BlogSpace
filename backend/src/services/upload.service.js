import { Readable } from "node:stream";
import { cloudinary, hasCloudinaryConfig } from "../config/cloudinary.js";
import { ApiError } from "../middleware/error.middleware.js";

export const uploadService = {
  uploadImage(fileBuffer, folder = "blogspace") {
    if (!hasCloudinaryConfig) {
      throw new ApiError(503, "Cloudinary is not configured");
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error) {
            reject(new ApiError(502, "Image upload failed"));
            return;
          }

          resolve(result);
        }
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  },
};

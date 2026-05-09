import { asyncHandler } from "../middleware/error.middleware.js";
import { uploadService } from "../services/upload.service.js";

export const uploadImageController = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadImage(req.file.buffer);

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

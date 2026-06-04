import { Router } from "express";
import { uploadImageController } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";

const router = Router();

/**
 * POST /api/uploads/image
 * Requires: multipart/form-data with a field named "image".
 * Returns:  { url, publicId } from Cloudinary.
 *
 * Constraints (enforced by upload.middleware.js):
 *   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
 *   - Max file size: 5 MB
 *
 * Requires Cloudinary env vars; returns 503 if not configured.
 */
router.post("/image", requireAuth, uploadImage.single("image"), uploadImageController);

export default router;

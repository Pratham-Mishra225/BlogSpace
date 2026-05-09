import { asyncHandler } from "../middleware/error.middleware.js";
import { postService } from "../services/post.service.js";

export const getPublishedPosts = asyncHandler(async (_req, res) => {
  const posts = await postService.findPublished();

  res.status(200).json({
    success: true,
    data: posts,
  });
});

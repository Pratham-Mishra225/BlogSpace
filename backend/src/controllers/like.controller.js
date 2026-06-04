import { asyncHandler } from "../middleware/error.middleware.js";
import { likeService } from "../services/like.service.js";

export const likeController = {
  /** POST /api/posts/:id/like */
  like: asyncHandler(async (req, res) => {
    const { id: postId } = req.validated.params;
    const result = await likeService.like(postId, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),

  /** DELETE /api/posts/:id/like */
  unlike: asyncHandler(async (req, res) => {
    const { id: postId } = req.validated.params;
    const result = await likeService.unlike(postId, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),
};

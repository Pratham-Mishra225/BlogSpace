import { asyncHandler } from "../middleware/error.middleware.js";
import { followService } from "../services/follow.service.js";

export const followController = {
  /** POST /api/users/:id/follow */
  follow: asyncHandler(async (req, res) => {
    const { id: targetUserId } = req.validated.params;
    const result = await followService.follow(targetUserId, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),

  /** DELETE /api/users/:id/follow */
  unfollow: asyncHandler(async (req, res) => {
    const { id: targetUserId } = req.validated.params;
    const result = await followService.unfollow(targetUserId, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),
};

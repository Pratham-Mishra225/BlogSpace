import { asyncHandler } from "../middleware/error.middleware.js";
import { userService } from "../services/user.service.js";

export const userController = {
  /** GET /api/users/:username — public; optionalAuth gives viewer context */
  getProfile: asyncHandler(async (req, res) => {
    const { username } = req.validated.params;
    const requestingUserId = req.user?._id ?? null;
    const profile = await userService.getProfile(username, requestingUserId);
    res.status(200).json({ success: true, data: profile });
  }),

  /** PATCH /api/users/me — authenticated; updates the current user's own profile */
  updateMe: asyncHandler(async (req, res) => {
    const user = await userService.updateMe(req.user._id, req.validated.body);
    res.status(200).json({ success: true, data: { user } });
  }),
};

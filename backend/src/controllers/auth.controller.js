import { asyncHandler } from "../middleware/error.middleware.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const authPayload = await authService.signup(req.validated.body);

    res.status(201).json({
      success: true,
      data: authPayload,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const authPayload = await authService.login(req.validated.body);

    res.status(200).json({
      success: true,
      data: authPayload,
    });
  }),

  me: asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: authService.getCurrentUser(req.user),
      },
    });
  }),
};

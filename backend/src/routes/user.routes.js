import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { followController } from "../controllers/follow.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { userValidators } from "../validators/user.validator.js";

const router = Router();

// ── Own-profile route must be defined BEFORE /:username to avoid "me" being
//    treated as a username parameter (even though Express method-matching means
//    it wouldn't actually conflict here, explicit ordering is clearer). ─────────
router.patch("/me", requireAuth, validate(userValidators.updateMe), userController.updateMe);

// ── Public profile lookup ──────────────────────────────────────────────────────
router.get(
  "/:username",
  optionalAuth,
  validate(userValidators.usernameParam),
  userController.getProfile
);

// ── Follow / unfollow ─────────────────────────────────────────────────────────
// :id here is the MongoDB ObjectId of the user being followed/unfollowed.
router.post(
  "/:id/follow",
  requireAuth,
  validate(userValidators.idParam),
  followController.follow
);
router.delete(
  "/:id/follow",
  requireAuth,
  validate(userValidators.idParam),
  followController.unfollow
);

export default router;

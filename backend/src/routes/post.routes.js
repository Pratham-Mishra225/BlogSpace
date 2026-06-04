import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { likeController } from "../controllers/like.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { postValidators } from "../validators/post.validator.js";

const router = Router();

// ── Public routes (like status resolved for authenticated viewers) ─────────────
router.get("/", optionalAuth, validate(postValidators.list), postController.list);
router.get("/:id", optionalAuth, validate(postValidators.idParam), postController.getById);

// ── Authenticated routes ───────────────────────────────────────────────────────
router.post("/", requireAuth, validate(postValidators.create), postController.create);
router.patch("/:id", requireAuth, validate(postValidators.update), postController.update);
router.delete("/:id", requireAuth, validate(postValidators.idParam), postController.remove);

// ── Like sub-resources (nested under posts) ────────────────────────────────────
router.post("/:id/like", requireAuth, validate(postValidators.idParam), likeController.like);
router.delete("/:id/like", requireAuth, validate(postValidators.idParam), likeController.unlike);

export default router;

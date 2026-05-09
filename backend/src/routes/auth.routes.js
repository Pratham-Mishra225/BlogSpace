import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authValidators } from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", validate(authValidators.signup), authController.signup);
router.post("/login", validate(authValidators.login), authController.login);
router.get("/me", requireAuth, authController.me);

export default router;

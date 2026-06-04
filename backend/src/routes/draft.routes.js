import { Router } from "express";
import { draftController } from "../controllers/draft.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { draftValidators } from "../validators/draft.validator.js";

const router = Router();

// Every draft route requires authentication — drafts are private to their author.
router.use(requireAuth);

router.get("/", draftController.list);
router.get("/:id", validate(draftValidators.idParam), draftController.getById);
router.post("/", validate(draftValidators.create), draftController.create);
router.patch("/:id", validate(draftValidators.update), draftController.update);
router.delete("/:id", validate(draftValidators.idParam), draftController.remove);

// POST /:id/publish must come before generic /:id routes to avoid ambiguity.
router.post("/:id/publish", validate(draftValidators.publish), draftController.publish);

export default router;

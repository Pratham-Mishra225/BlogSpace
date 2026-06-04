import { asyncHandler } from "../middleware/error.middleware.js";
import { draftService } from "../services/draft.service.js";

export const draftController = {
  /** GET /api/drafts */
  list: asyncHandler(async (req, res) => {
    const drafts = await draftService.list(req.user._id);
    res.status(200).json({ success: true, data: { drafts } });
  }),

  /** GET /api/drafts/:id */
  getById: asyncHandler(async (req, res) => {
    const draft = await draftService.findById(req.validated.params.id, req.user._id);
    res.status(200).json({ success: true, data: draft });
  }),

  /** POST /api/drafts */
  create: asyncHandler(async (req, res) => {
    const draft = await draftService.create(req.user._id, req.validated.body);
    res.status(201).json({ success: true, data: draft });
  }),

  /** PATCH /api/drafts/:id */
  update: asyncHandler(async (req, res) => {
    const draft = await draftService.update(
      req.validated.params.id,
      req.user._id,
      req.validated.body
    );
    res.status(200).json({ success: true, data: draft });
  }),

  /** DELETE /api/drafts/:id */
  remove: asyncHandler(async (req, res) => {
    const result = await draftService.remove(req.validated.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),

  /** POST /api/drafts/:id/publish */
  publish: asyncHandler(async (req, res) => {
    const post = await draftService.publish(
      req.validated.params.id,
      req.user._id,
      req.validated.body
    );
    // 201 because a new Post resource is being created.
    res.status(201).json({ success: true, data: post });
  }),
};

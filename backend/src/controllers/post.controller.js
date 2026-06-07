import { asyncHandler } from "../middleware/error.middleware.js";
import { postService } from "../services/post.service.js";

export const postController = {
  /** GET /api/posts */
  list: asyncHandler(async (req, res) => {
    const { page, limit, tag, search, author } = req.validated.query;
    const userId = req.user?._id ?? null; // optionalAuth may leave req.user null
    const result = await postService.list({ page, limit, tag, search, author }, userId);
    res.status(200).json({ success: true, data: result });
  }),

  /** GET /api/posts/feed/following — requires authentication */
  listFollowing: asyncHandler(async (req, res) => {
    const { page, limit } = req.validated.query;
    const result = await postService.listFollowing({ page, limit }, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),

  /** GET /api/posts/:id */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const userId = req.user?._id ?? null;
    const post = await postService.findById(id, userId);
    res.status(200).json({ success: true, data: post });
  }),

  /** POST /api/posts */
  create: asyncHandler(async (req, res) => {
    const post = await postService.create(req.user._id, req.validated.body);
    res.status(201).json({ success: true, data: post });
  }),

  /** PATCH /api/posts/:id */
  update: asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const post = await postService.update(id, req.user._id, req.validated.body);
    res.status(200).json({ success: true, data: post });
  }),

  /** DELETE /api/posts/:id */
  remove: asyncHandler(async (req, res) => {
    const { id } = req.validated.params;
    const result = await postService.remove(id, req.user._id);
    res.status(200).json({ success: true, data: result });
  }),
};

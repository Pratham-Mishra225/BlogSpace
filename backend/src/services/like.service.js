import { Like } from "../models/Like.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../middleware/error.middleware.js";

export const likeService = {
  /**
   * Likes a post.
   * - Only published posts can be liked.
   * - Returns 409 if the user has already liked the post.
   * - Increments the Post.likeCount denormalized counter atomically.
   */
  async like(postId, userId) {
    const post = await Post.findById(postId).select("status likeCount");
    if (!post || post.status !== "published") {
      throw new ApiError(404, "Post not found");
    }

    const existing = await Like.exists({ user: userId, post: postId });
    if (existing) throw new ApiError(409, "You have already liked this post");

    await Like.create({ user: userId, post: postId });

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: 1 } },
      { new: true }
    ).select("likeCount");

    return { likeCount: updated.likeCount, isLiked: true };
  },

  /**
   * Unlikes a post.
   * - Returns 404 if no Like document exists (i.e. user hadn't liked the post).
   * - Decrements the Post.likeCount counter (floor 0 via $max guard).
   */
  async unlike(postId, userId) {
    const post = await Post.findById(postId).select("status likeCount");
    if (!post || post.status !== "published") {
      throw new ApiError(404, "Post not found");
    }

    const deleted = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!deleted) throw new ApiError(404, "You have not liked this post");

    // Decrement but never go below 0.
    const updated = await Post.findByIdAndUpdate(
      postId,
      [{ $set: { likeCount: { $max: [0, { $subtract: ["$likeCount", 1] }] } } }],
      { new: true }
    ).select("likeCount");

    return { likeCount: updated.likeCount, isLiked: false };
  },
};

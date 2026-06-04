import { Follow } from "../models/Follow.js";
import { User } from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";

export const followService = {
  /**
   * Follows a user.
   * - Prevents self-follow.
   * - Returns 404 if the target user doesn't exist.
   * - Returns 409 if already following.
   * - Increments denormalized follower/following counts on both users atomically.
   */
  async follow(targetUserId, currentUserId) {
    if (targetUserId.toString() === currentUserId.toString()) {
      throw new ApiError(400, "You cannot follow yourself");
    }

    const target = await User.findById(targetUserId).select("_id");
    if (!target) throw new ApiError(404, "User not found");

    const existing = await Follow.exists({ follower: currentUserId, following: targetUserId });
    if (existing) throw new ApiError(409, "You are already following this user");

    await Follow.create({ follower: currentUserId, following: targetUserId });

    // Update denormalized counters on both sides in parallel.
    await Promise.all([
      User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
      User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } }),
    ]);

    return { following: true };
  },

  /**
   * Unfollows a user.
   * - Returns 404 if the Follow document doesn't exist (i.e. not currently following).
   * - Decrements denormalized follower/following counts on both users.
   *   Counts are floored at 0 via Math.max in the UI layer; the DB uses min:0 on the model.
   */
  async unfollow(targetUserId, currentUserId) {
    if (targetUserId.toString() === currentUserId.toString()) {
      throw new ApiError(400, "You cannot unfollow yourself");
    }

    const deleted = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!deleted) throw new ApiError(404, "You are not following this user");

    await Promise.all([
      User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } }),
      User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } }),
    ]);

    return { following: false };
  },

  /** Utility used by other services to check a follow relationship. */
  async isFollowing(targetUserId, currentUserId) {
    const exists = await Follow.exists({ follower: currentUserId, following: targetUserId });
    return !!exists;
  },
};

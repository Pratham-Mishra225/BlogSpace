import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Follow } from "../models/Follow.js";
import { ApiError } from "../middleware/error.middleware.js";

export const userService = {
  /** Primitive lookup used by the auth middleware. */
  findByUsername(username) {
    return User.findOne({ username: username?.toLowerCase() });
  },

  /**
   * Returns a public profile: user data, their published posts, follower/
   * following counts, and (if a viewer is logged in) whether they follow
   * this user.
   */
  async getProfile(username, requestingUserId = null) {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) throw new ApiError(404, "User not found");

    const [posts, isFollowingDoc] = await Promise.all([
      Post.find({ author: user._id, status: "published" })
        .sort({ publishedAt: -1 })
        .populate("author", "name username avatar bio followersCount followingCount"),
      requestingUserId
        ? Follow.exists({ follower: requestingUserId, following: user._id })
        : Promise.resolve(null),
    ]);

    return {
      user: user.toJSON(),
      posts: posts.map((p) => ({ ...p.toObject(), isLiked: false })),
      isFollowing: !!isFollowingDoc,
    };
  },

  /**
   * Updates the authenticated user's own profile.
   * Rejects username changes that collide with an existing account.
   */
  async updateMe(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Enforce username uniqueness only when the username is actually changing.
    if (data.username && data.username !== user.username) {
      const conflict = await User.findOne({ username: data.username }).select("_id");
      if (conflict) throw new ApiError(409, "Username is already taken");
    }

    Object.assign(user, data);
    await user.save();
    return user.toJSON();
  },
};

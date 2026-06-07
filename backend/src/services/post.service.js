import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { Follow } from "../models/Follow.js";
import { User } from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";

// Fields projected from the author sub-document in every post response.
const AUTHOR_SELECT = "name username avatar bio followersCount followingCount";

/**
 * Batch-decorates an array of post documents with the viewer's like status.
 * Uses a single Like query for all posts instead of one query per post (N+1).
 */
const decoratePosts = async (posts, userId) => {
  const objects = posts.map((p) => (p.toObject ? p.toObject() : { ...p }));

  if (!userId || objects.length === 0) {
    return objects.map((p) => ({ ...p, isLiked: false }));
  }

  const postIds = objects.map((p) => p._id);
  const likes = await Like.find({ user: userId, post: { $in: postIds } }).select("post");
  const likedSet = new Set(likes.map((l) => l.post.toString()));

  return objects.map((p) => ({
    ...p,
    isLiked: likedSet.has(p._id.toString()),
  }));
};

const buildPagination = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

export const postService = {
  /**
   * Returns a paginated list of published posts with optional filtering.
   * Supports: pagination (page, limit), tag filter, author username filter,
   * and full-text search (uses the existing text index on the Post model).
   */
  async list({ page = 1, limit = 10, tag, search, author } = {}, userId = null) {
    const filter = { status: "published" };

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    if (author) {
      const authorDoc = await User.findOne({ username: author.toLowerCase() }).select("_id");
      // If the given username doesn't exist, return an empty result set rather than an error.
      if (!authorDoc) {
        return { posts: [], ...buildPagination(0, page, limit) };
      }
      filter.author = authorDoc._id;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const sortStage = search
      ? { score: { $meta: "textScore" }, publishedAt: -1 }
      : { publishedAt: -1 };

    const projection = search ? { score: { $meta: "textScore" } } : {};

    const [posts, total] = await Promise.all([
      Post.find(filter, projection)
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_SELECT),
      Post.countDocuments(filter),
    ]);

    const decorated = await decoratePosts(posts, userId);
    return { posts: decorated, ...buildPagination(total, page, limit) };
  },

  /**
   * Returns a paginated feed of published posts written by authors the
   * current user follows.
   *
   * Query strategy (2 DB round-trips + 1 batched like-decoration):
   *   1. Follow.find({ follower }) → array of following ObjectIds (lean, indexed).
   *   2. Post.find({ author: { $in: followingIds } }) → paginated results.
   *   3. decoratePosts() → single Like query for the entire page.
   *
   * Returns an empty page immediately when the user follows nobody.
   */
  async listFollowing({ page = 1, limit = 10 } = {}, currentUserId) {
    if (!currentUserId) {
      throw new ApiError(401, "Authentication required");
    }

    // Step 1: Fetch all author IDs the current user follows (lean = plain JS, faster).
    const followDocs = await Follow.find({ follower: currentUserId })
      .select("following")
      .lean();

    const followingIds = followDocs.map((f) => f.following);

    // No follows → return an empty page without touching the Posts collection.
    if (followingIds.length === 0) {
      return { posts: [], ...buildPagination(0, page, limit) };
    }

    // Step 2: Fetch paginated posts from followed authors only.
    const filter = { status: "published", author: { $in: followingIds } };
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", AUTHOR_SELECT),
      Post.countDocuments(filter),
    ]);

    // Step 3: Batch-decorate with like status.
    const decorated = await decoratePosts(posts, currentUserId);
    return { posts: decorated, ...buildPagination(total, page, limit) };
  },

  /**
   * Finds a single published post by its MongoDB ObjectId OR its slug.
   * Slug lookup is a fallback so pretty URLs work (e.g. /posts/my-great-article).
   */
  async findById(id, userId = null) {
    let post = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      post = await Post.findById(id).populate("author", AUTHOR_SELECT);
    }

    // Fall back to slug lookup if no document was found by ObjectId.
    if (!post) {
      post = await Post.findOne({ slug: id }).populate("author", AUTHOR_SELECT);
    }

    if (!post || post.status !== "published") {
      throw new ApiError(404, "Post not found");
    }

    const [decorated] = await decoratePosts([post], userId);
    return decorated;
  },

  /**
   * Creates a new published post. The slug is auto-generated by the Post model's
   * pre-validate hook so it does not need to be supplied here.
   */
  async create(authorId, data) {
    const post = await Post.create({ author: authorId, ...data });
    await post.populate("author", AUTHOR_SELECT);
    return { ...post.toObject(), isLiked: false };
  },

  /**
   * Partially updates a post. Only the post's owner may edit it.
   * The slug is intentionally NOT regenerated when the title changes
   * to preserve existing external links (SEO stability).
   */
  async update(id, authorId, data) {
    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== authorId.toString()) {
      throw new ApiError(403, "You are not authorised to edit this post");
    }

    Object.assign(post, data);
    await post.save();
    await post.populate("author", AUTHOR_SELECT);

    const [decorated] = await decoratePosts([post], authorId);
    return decorated;
  },

  /**
   * Deletes a post and cascades the deletion to all its Like documents.
   * Only the post's owner may delete it.
   */
  async remove(id, authorId) {
    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== authorId.toString()) {
      throw new ApiError(403, "You are not authorised to delete this post");
    }

    await Promise.all([
      Post.deleteOne({ _id: id }),
      Like.deleteMany({ post: id }),
    ]);

    return { id };
  },
};

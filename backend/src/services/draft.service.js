import { Draft } from "../models/Draft.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../middleware/error.middleware.js";

const AUTHOR_SELECT = "name username avatar bio followersCount followingCount";

/**
 * Ownership guard used by every mutating method.
 * The author field on Draft is a raw ObjectId when not populated,
 * so we compare via toString() to handle both cases.
 */
const assertOwner = (draft, userId) => {
  const authorId = draft.author?._id?.toString() ?? draft.author?.toString();
  if (authorId !== userId.toString()) {
    throw new ApiError(403, "You do not have access to this draft");
  }
};

export const draftService = {
  /** Returns all drafts belonging to the authenticated user, newest first. */
  async list(authorId) {
    const drafts = await Draft.find({ author: authorId })
      .sort({ updatedAt: -1 })
      .populate("author", AUTHOR_SELECT);
    return drafts.map((d) => d.toObject());
  },

  /** Returns a single draft — only if the requester owns it. */
  async findById(id, authorId) {
    const draft = await Draft.findById(id).populate("author", AUTHOR_SELECT);
    if (!draft) throw new ApiError(404, "Draft not found");
    assertOwner(draft, authorId);
    return draft.toObject();
  },

  /** Creates a blank or partially-filled draft for the authenticated user. */
  async create(authorId, data) {
    const draft = await Draft.create({ author: authorId, ...data });
    await draft.populate("author", AUTHOR_SELECT);
    return draft.toObject();
  },

  /** Partially updates a draft — only the owner may do so. */
  async update(id, authorId, data) {
    const draft = await Draft.findById(id);
    if (!draft) throw new ApiError(404, "Draft not found");
    assertOwner(draft, authorId);

    Object.assign(draft, data);
    await draft.save();
    await draft.populate("author", AUTHOR_SELECT);
    return draft.toObject();
  },

  /** Deletes a draft — only the owner may do so. */
  async remove(id, authorId) {
    const draft = await Draft.findById(id);
    if (!draft) throw new ApiError(404, "Draft not found");
    assertOwner(draft, authorId);

    await Draft.deleteOne({ _id: id });
    return { id };
  },

  /**
   * Publishes a draft by:
   * 1. Validating that the draft has a usable title and content.
   * 2. Creating a Post document from the draft's data.
   * 3. Deleting the draft (atomic-ish — worst case leaves an orphaned draft
   *    which can be retried or cleaned up; a Post already created is not lost).
   *
   * The caller may pass an optional `title` override to rename the post at
   * publish time without having to PATCH the draft first.
   */
  async publish(id, authorId, { title: titleOverride } = {}) {
    const draft = await Draft.findById(id);
    if (!draft) throw new ApiError(404, "Draft not found");
    assertOwner(draft, authorId);

    const title = titleOverride?.trim() || draft.title?.trim();
    if (!title || title === "Untitled draft") {
      throw new ApiError(400, "Please add a title before publishing");
    }

    const content = draft.content?.trim();
    if (!content) {
      throw new ApiError(400, "Please add content before publishing");
    }

    // Create the Post first — if this fails the draft is preserved.
    const post = await Post.create({
      author: authorId,
      title,
      excerpt: draft.excerpt,
      content: draft.content,
      coverImage: draft.coverImage,
      tags: draft.tags,
    });

    // Only delete the draft once the Post is persisted.
    await Draft.deleteOne({ _id: id });

    await post.populate("author", AUTHOR_SELECT);
    return { ...post.toObject(), isLiked: false };
  },
};

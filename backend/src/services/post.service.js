import { Post } from "../models/Post.js";

export const postService = {
  findPublished(filter = {}) {
    return Post.find({ status: "published", ...filter }).sort({ publishedAt: -1 });
  },
};

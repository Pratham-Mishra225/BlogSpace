import mongoose from "mongoose";
import { calculateReadingTime } from "../utils/calculateReadingTime.js";
import { slugify } from "../utils/slugify.js";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["published", "archived"],
      default: "published",
      index: true,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

postSchema.pre("validate", function setComputedFields(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (this.isModified("content")) {
    this.readingTime = calculateReadingTime(this.content);
  }

  next();
});

postSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });
postSchema.index({ author: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);

import mongoose from "mongoose";
import { calculateReadingTime } from "../utils/calculateReadingTime.js";

const draftSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "Untitled draft",
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    tags: {
      type: [String],
      default: [],
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

draftSchema.pre("save", function setDraftMetadata(next) {
  if (this.isModified("content")) {
    this.readingTime = calculateReadingTime(this.content);
  }

  this.lastSavedAt = new Date();
  next();
});

draftSchema.index({ author: 1, updatedAt: -1 });

export const Draft = mongoose.model("Draft", draftSchema);

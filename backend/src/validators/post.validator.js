import { z } from "zod";

const tagsSchema = z.array(z.string().trim().min(1).max(30)).max(8).default([]);

// Accepts either a plain URL string or an object {url, publicId}.
// Both forms are normalised to the object shape that the Post model expects.
const coverImageSchema = z
  .union([
    z
      .string()
      .trim()
      .max(2048)
      .transform((url) => ({ url, publicId: "" })),
    z.object({
      url: z.string().trim().max(2048).optional().default(""),
      publicId: z.string().trim().max(512).optional().default(""),
    }),
  ])
  .optional()
  .default({ url: "", publicId: "" });

// Reusable "just an :id param, no body, no query" schema
const idParam = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().trim().min(1) }),
  query: z.object({}),
});

const listQuery = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
    tag: z.string().trim().optional(),
    search: z.string().trim().optional(),
    author: z.string().trim().optional(), // filter by author username
  }),
});

export const postValidators = {
  list: listQuery,
  idParam,

  create: z.object({
    body: z.object({
      title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
      excerpt: z.string().trim().max(300).optional().default(""),
      content: z.string().min(1, "Content is required"),
      coverImage: coverImageSchema,
      tags: tagsSchema.optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  update: z.object({
    body: z
      .object({
        title: z.string().trim().min(3).max(160).optional(),
        excerpt: z.string().trim().max(300).optional(),
        content: z.string().min(1).optional(),
        coverImage: coverImageSchema,
        tags: tagsSchema.optional(),
        status: z.enum(["published", "archived"]).optional(),
      })
      .refine((b) => Object.keys(b).length > 0, { message: "At least one field is required" }),
    params: z.object({ id: z.string().trim().min(1) }),
    query: z.object({}),
  }),
};

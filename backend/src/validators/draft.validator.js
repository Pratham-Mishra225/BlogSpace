import { z } from "zod";

const tagsSchema = z.array(z.string().trim().min(1).max(30)).max(8).default([]);

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

const idParam = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().trim().min(1) }),
  query: z.object({}),
});

export const draftValidators = {
  idParam,

  // All fields are optional when creating a draft — writers start blank.
  create: z.object({
    body: z.object({
      title: z.string().trim().max(160).optional().default("Untitled draft"),
      excerpt: z.string().trim().max(300).optional().default(""),
      content: z.string().optional().default(""),
      coverImage: coverImageSchema,
      tags: tagsSchema.optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  }),

  // Same shape as create but all fields remain optional.
  update: z.object({
    body: z.object({
      title: z.string().trim().max(160).optional(),
      excerpt: z.string().trim().max(300).optional(),
      content: z.string().optional(),
      coverImage: coverImageSchema,
      tags: tagsSchema.optional(),
    }),
    params: z.object({ id: z.string().trim().min(1) }),
    query: z.object({}),
  }),

  // Optionally override the title at publish time.
  publish: z.object({
    body: z.object({
      title: z.string().trim().min(3).max(160).optional(),
    }),
    params: z.object({ id: z.string().trim().min(1) }),
    query: z.object({}),
  }),
};

import { z } from "zod";

const tagsSchema = z.array(z.string().trim().min(1).max(30)).max(8).default([]);

export const postValidators = {
  create: z.object({
    body: z.object({
      title: z.string().trim().min(3).max(160),
      excerpt: z.string().trim().max(300).optional(),
      content: z.string().min(1),
      tags: tagsSchema.optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  }),
};

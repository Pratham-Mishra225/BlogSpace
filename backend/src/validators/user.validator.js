import { z } from "zod";

export const userValidators = {
  // GET /api/users/:username
  usernameParam: z.object({
    body: z.object({}),
    params: z.object({
      username: z.string().trim().min(3).max(30),
    }),
    query: z.object({}),
  }),

  // POST|DELETE /api/users/:id/follow
  idParam: z.object({
    body: z.object({}),
    params: z.object({ id: z.string().trim().min(1) }),
    query: z.object({}),
  }),

  // PATCH /api/users/me
  updateMe: z.object({
    body: z
      .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
        bio: z.string().trim().max(280).optional(),
        avatar: z.string().trim().url("Avatar must be a valid URL").max(2048).optional(),
        username: z
          .string()
          .trim()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username cannot exceed 30 characters")
          .regex(
            /^[a-z0-9_]+$/,
            "Username can only contain lowercase letters, numbers, and underscores"
          )
          .transform((v) => v.toLowerCase())
          .optional(),
      })
      .refine((b) => Object.keys(b).length > 0, {
        message: "At least one field is required to update",
      }),
    params: z.object({}),
    query: z.object({}),
  }),
};

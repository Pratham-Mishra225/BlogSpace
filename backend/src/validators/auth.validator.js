import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
  .transform((username) => username.toLowerCase());

const emailSchema = z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters");

const signup = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    bio: z.string().trim().max(280).optional().default(""),
    avatar: z.string().trim().max(2048).optional().default(""),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const authValidators = {
  signup,
  login: z.object({
    body: z.object({
      email: emailSchema,
      password: z.string().min(1, "Password is required").max(128),
    }),
    params: z.object({}),
    query: z.object({}),
  }),
  register: signup,
};

import { z } from "zod";

export const userValidators = {
  usernameParam: z.object({
    body: z.object({}),
    params: z.object({
      username: z.string().trim().min(3).max(30),
    }),
    query: z.object({}),
  }),
};

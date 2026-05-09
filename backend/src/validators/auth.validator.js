import { z } from "zod";

export const authValidators = {
  register: z.object({
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  }),
};

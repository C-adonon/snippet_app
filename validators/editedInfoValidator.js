import { z } from "zod";

const editedInfoValidator = z.object({
  photo: z.optional(z.string()),
  email: z.optional(z.string().email()),
  password: z.optional(z.string()),
});

export { editedInfoValidator };

import { z } from "zod";

const credentialsValidator = z.object({
  photo: z.optional(z.string()),
  email: z.string().email(),
  password: z.string(),
});

export { credentialsValidator };

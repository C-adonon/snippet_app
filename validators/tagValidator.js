import { z } from "zod";

const tagValidator = z.object({
  name: z.string(),
});

export { tagValidator };

import { z } from "zod";

const categoryValidator = z.object({
  name: z.string(),
});

export { categoryValidator };

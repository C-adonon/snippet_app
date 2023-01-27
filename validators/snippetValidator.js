import { z } from "zod";

const snippetValidator = z.object({
  content: z.string(),
});

export { snippetValidator };

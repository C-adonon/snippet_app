import { z } from "zod";

const snippetValidator = z.object({
  title: z.string(),
  content: z.string(),
});

export { snippetValidator };

import { z } from "zod";

const snippetValidator = z.object({
  title: z.string(),
  content: z.string(),
  category_id: z.number(),
  tags: z.optional(z.nullable(z.array(z.number()))),
});

export { snippetValidator };

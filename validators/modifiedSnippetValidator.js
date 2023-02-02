import { z } from "zod";

const modifiedSnippetValidator = z.object({
  title: z.optional(z.string()),
  content: z.optional(z.string()),
  category_id: z.optional(z.number()),
  tags: z.optional(z.nullable(z.array(z.number()))),
});

export { modifiedSnippetValidator };

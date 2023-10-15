import { z } from "zod";

import { Collection } from "./base";

export const Chapter = Collection.extend({
  name: z.string(),
  idx: z.number(),
  manga: z.string(),
  cover: z.string(),
  pages: z.array(z.string()),
});
export type Chapter = z.infer<typeof Chapter>;

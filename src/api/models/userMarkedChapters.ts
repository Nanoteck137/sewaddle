import { z } from "zod";

import { Collection } from "./base";

export const UserMarkedChapter = Collection.extend({
  user: z.string(),
  chapter: z.string(),
});
export type UserMarkedChapter = z.infer<typeof UserMarkedChapter>;

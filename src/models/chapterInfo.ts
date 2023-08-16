import { z } from "zod";

import { Collection } from "./collection";

export const USER_CHAPTER_COLLECTION_NAME = "userChapter";

export const UserChapter = Collection.extend({
  user: z.string(),
  chapter: z.string(),
  read: z.boolean(),
  currentPage: z.number(),
});
export type UserChapter = z.infer<typeof UserChapter>;

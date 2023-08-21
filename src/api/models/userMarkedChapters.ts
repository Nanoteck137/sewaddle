import { z } from "zod";

import { Collection, createGetFullListSchema } from "./base";

export const UserMarkedChapter = Collection.extend({
  user: z.string(),
  chapter: z.string(),
});
export type UserMarkedChapter = z.infer<typeof UserMarkedChapter>;

export const UserMarkedChapterFullList =
  createGetFullListSchema(UserMarkedChapter);
export type UserMarkedChapterFullList = z.infer<
  typeof UserMarkedChapterFullList
>;

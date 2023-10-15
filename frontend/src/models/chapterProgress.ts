import { z } from "zod";

import { Collection } from "./collection";

export const CHAPTER_RPOGRESS_COLLECTION_NAME = "chapterProgress";

export const ChapterProgress = Collection.extend({
  user: z.string(),
  chapter: z.string(),
  read: z.boolean(),
  currentPage: z.number(),
});
export type ChapterProgress = z.infer<typeof ChapterProgress>;

import { z } from "zod";

import { Collection, createGetListSchema } from "./collection";

export const Chapter = Collection.extend({
  name: z.string(),
  index: z.number(),
  manga: z.string(),
  pages: z.array(z.string()),
});
export type Chapter = z.infer<typeof Chapter>;

export const BasicChapter = Chapter.omit({ pages: true });
export type BasicChapter = z.infer<typeof BasicChapter>;

export const GetChapterList = createGetListSchema(Chapter);
export type GetChapterList = z.infer<typeof GetChapterList>;

export const GetBasicChapterList = createGetListSchema(BasicChapter);
export type GetBasicChapterList = z.infer<typeof GetBasicChapterList>;

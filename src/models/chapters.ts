import { z } from "zod";

import { Collection, createGetListSchema, ViewCollection } from "./collection";

export const BASIC_CHAPTER_INFO_COLLECTION = "basicChapterInfo";

export const Chapter = Collection.extend({
  name: z.string(),
  idx: z.number(),
  manga: z.string(),
  cover: z.string(),
  pages: z.array(z.string()),
});
export type Chapter = z.infer<typeof Chapter>;

export const BasicChapter = Chapter.omit({ pages: true }).extend({
  pageCount: z.number(),
});
export type BasicChapter = z.infer<typeof BasicChapter>;

export const NextChapter = ViewCollection.extend({
  next: z.string(),
});
export type NextChapter = z.infer<typeof NextChapter>;

export const PrevChapter = ViewCollection.extend({
  prev: z.string(),
});
export type PrevChapter = z.infer<typeof NextChapter>;

export const GetChapterList = createGetListSchema(Chapter);
export type GetChapterList = z.infer<typeof GetChapterList>;

export const GetBasicChapterList = createGetListSchema(BasicChapter);
export type GetBasicChapterList = z.infer<typeof GetBasicChapterList>;

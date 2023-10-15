import { z } from "zod";

import { Collection, createGetListSchema } from "./collection";

export const BASIC_CHAPTER_INFO_COLLECTION = "basicChapterInfo";

export const Chapter = Collection.extend({
  name: z.string(),
  idx: z.number(),
  group: z.number(),
  manga: z.string(),
  cover: z.string(),
  pages: z.array(z.string()),
});
export type Chapter = z.infer<typeof Chapter>;

export const BasicChapter = Chapter.omit({ pages: true }).extend({
  pageCount: z.number(),
});
export type BasicChapter = z.infer<typeof BasicChapter>;

export const GetChapterList = createGetListSchema(Chapter);
export type GetChapterList = z.infer<typeof GetChapterList>;

export const GetBasicChapterList = createGetListSchema(BasicChapter);
export type GetBasicChapterList = z.infer<typeof GetBasicChapterList>;

export const UserLastReadChapter = Collection.extend({
  user: z.string(),
  manga: z.string(),
  chapter: z.string(),
  page: z.number(),
});
export type UserLastReadChapter = z.infer<typeof UserLastReadChapter>;

export const UserChapterRead = Collection.extend({
  user: z.string(),
  chapter: z.string(),
});
export type UserChapterRead = z.infer<typeof UserChapterRead>;

export const UserChapterReadList = z.array(UserChapterRead);
export type UserChapterReadList = z.infer<typeof UserChapterReadList>;

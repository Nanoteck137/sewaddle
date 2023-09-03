import { z } from "zod";

import { createGetPagedListSchema, Id, ViewCollection } from "./base";

export const ChapterView = ViewCollection.extend({
  name: z.string(),
  idx: z.number(),
  cover: z.string(),
  manga: Id,
  pageCount: z.number(),

  created: z.coerce.date(),
  updated: z.coerce.date(),
});
export type ChapterView = z.infer<typeof ChapterView>;

export const ChapterViewPagedList = createGetPagedListSchema(ChapterView);
export type ChapterViewPagedList = z.infer<typeof ChapterViewPagedList>;

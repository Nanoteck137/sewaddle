import { z } from "zod";

import { createGetFullListSchema, ViewCollection } from "./base";

export const MangaView = ViewCollection.extend({
  englishTitle: z.string(),
  nativeTitle: z.string(),
  romajiTitle: z.string(),
  color: z.string(),
  cover: z.string(),
  chaptersAvailable: z.number(),
});
export type MangaView = z.infer<typeof MangaView>;

export const MangaViewFullList = createGetFullListSchema(MangaView);
export type MangaViewFullList = z.infer<typeof MangaViewFullList>;

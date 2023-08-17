import { z } from "zod";

import { Collection, createGetListSchema } from "./collection";

export const MANGAS_COLLECTION_NAME = "mangas";
export const MANGA_DISPLAY_COLLECTION_NAME = "fullMangaDisplay";

export const Manga = Collection.extend({
  name: z.string(),
  englishTitle: z.string(),
  nativeTitle: z.string(),
  romajiTitle: z.string(),
  malUrl: z.string().url(),
  anilistUrl: z.string().url(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (arg) => (arg === "" ? null : arg),
    z.coerce.date().nullish(),
  ),
  color: z.string(),
  isGroup: z.boolean(),
  banner: z.string(),
  coverMedium: z.string(),
  coverLarge: z.string(),
  coverExtraLarge: z.string(),
});
export type Manga = z.infer<typeof Manga>;

export const MangaView = Manga.extend({
  chaptersAvailable: z.number(),
});
export type MangaView = z.infer<typeof MangaView>;

export const GetMangaRequest = createGetListSchema(Manga);
export type GetMangaRequest = z.infer<typeof GetMangaRequest>;

export const GetMangaViewRequest = createGetListSchema(MangaView);
export type GetMangaViewRequest = z.infer<typeof GetMangaViewRequest>;

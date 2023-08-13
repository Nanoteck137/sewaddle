import { z } from "zod";

import { Collection, createGetListSchema } from "./collection";

export const MANGAS_COLLECTION_NAME = "mangas";
export const MANGA_VIEWS_COLLECTION_NAME = "manga_views";

export const Manga = Collection.extend({
  name: z.string(),
  cover: z.string(),
  malUrl: z.string().url(),
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

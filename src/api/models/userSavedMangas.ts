import { z } from "zod";

import { MangaView } from "..";
import { Collection, createGetPagedListSchema, Id } from "./base";

export const UserSavedManga = Collection.extend({
  user: Id,
  manga: Id,
});
export type UserSavedManga = z.infer<typeof UserSavedManga>;

export const UserSavedMangaPagedList = createGetPagedListSchema(UserSavedManga);
export type UserSavedMangaPagedList = z.infer<typeof UserSavedMangaPagedList>;

export const UserSavedMangaExpanded = UserSavedManga.extend({
  expand: z.object({
    manga: MangaView,
  }),
});
export type UserSavedMangaExpanded = z.infer<typeof UserSavedMangaExpanded>;

export const UserSavedMangaExpandedPagedList = createGetPagedListSchema(
  UserSavedMangaExpanded,
);
export type UserSavedMangaExpandedPagedList = z.infer<
  typeof UserSavedMangaExpandedPagedList
>;

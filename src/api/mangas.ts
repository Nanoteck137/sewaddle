import { ClientResponseError } from "pocketbase";

import { Manga } from "./models/mangas";
import { MangaViewFullList } from "./models/mangaViews";
import { UserBookmark } from "./models/userBookmarks";
import {
  UserSavedManga,
  UserSavedMangaExpandedPagedList,
} from "./models/userSavedMangas";
import { pb } from "./pocketbase";

export async function fetchMangaViews() {
  const list = await pb.collection("mangaViews").getFullList();
  return await MangaViewFullList.parseAsync(list);
}

export async function fetchSingleManga(mangaId: string) {
  const rec = await pb.collection("mangas").getOne(mangaId);
  return await Manga.parseAsync(rec);
}

export async function fetchUserBookmark(userId: string, mangaId: string) {
  try {
    const result = await pb
      .collection("userBookmarks")
      .getFirstListItem(`user = "${userId}" && manga = "${mangaId}"`);
    return await UserBookmark.parseAsync(result);
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (e.status === 404) {
        return null;
      }
    }

    throw e;
  }
}

export async function fetchUserSavedManga(userId: string, mangaId: string) {
  try {
    const result = await pb
      .collection("userSavedMangas")
      .getFirstListItem(`user = "${userId}" && manga = "${mangaId}"`);
    return await UserSavedManga.parseAsync(result);
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (e.status === 404) {
        return null;
      }
    }

    throw e;
  }
}

export async function createUserSavedManga(userId: string, mangaId: string) {
  const result = await pb.collection("userSavedMangas").create({
    user: userId,
    manga: mangaId,
  });
  return await UserSavedManga.parseAsync(result);
}

export async function removeUserSavedManga(userId: string, mangaId: string) {
  const savedManga = await fetchUserSavedManga(userId, mangaId);
  if (!savedManga) {
    return null;
  }

  const result = await pb.collection("userSavedMangas").delete(savedManga.id);
  return result;
}

export async function fetchUserSavedMangas(userId: string, page: number) {
  const result = await pb
    .collection("userSavedMangas")
    .getList(page, undefined, {
      filter: `user = "${userId}"`,
      expand: "manga",
    });

  return await UserSavedMangaExpandedPagedList.parseAsync(result);
}

export async function createUserMangaSaved(userId: string, mangaId: string) {
  return await pb.collection("userMangaSaved").create({
    user: userId,
    manga: mangaId,
  });
}

export async function deleteUserMangaSaved(id: string) {
  return await pb.collection("userMangaSaved").delete(id);
}

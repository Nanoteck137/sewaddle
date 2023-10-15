import { ClientResponseError } from "pocketbase";

import { Id } from "./models/base";
import { Manga } from "./models/mangas";
import { MangaViewFullList } from "./models/mangaViews";
import { UserBookmark } from "./models/userBookmarks";
import { User } from "./models/users";
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

export async function fetchUserBookmark(user: User, mangaId: Id) {
  try {
    const result = await pb
      .collection("userBookmarks")
      .getFirstListItem(`user = "${user.id}" && manga = "${mangaId}"`);
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

export async function fetchUserSavedManga(user: User, mangaId: Id) {
  try {
    const result = await pb
      .collection("userSavedMangas")
      .getFirstListItem(`user = "${user.id}" && manga = "${mangaId}"`);
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

export async function createUserSavedManga(user: User, mangaId: Id) {
  const result = await pb.collection("userSavedMangas").create({
    user: user.id,
    manga: mangaId,
  });
  return await UserSavedManga.parseAsync(result);
}

export async function removeUserSavedManga(user: User, mangaId: Id) {
  const savedManga = await fetchUserSavedManga(user, mangaId);
  if (!savedManga) {
    return null;
  }

  const result = await pb.collection("userSavedMangas").delete(savedManga.id);
  return result;
}

export async function fetchUserSavedMangas(user: User, page: number) {
  const result = await pb
    .collection("userSavedMangas")
    .getList(page, undefined, {
      filter: `user = "${user.id}"`,
      expand: "manga",
    });

  return await UserSavedMangaExpandedPagedList.parseAsync(result);
}

export async function createUserMangaSaved(user: User, mangaId: Id) {
  return await pb.collection("userMangaSaved").create({
    user: user.id,
    manga: mangaId,
  });
}

export async function deleteUserMangaSaved(id: Id) {
  return await pb.collection("userMangaSaved").delete(id);
}

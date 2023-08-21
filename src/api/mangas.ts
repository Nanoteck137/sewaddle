import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { z } from "zod";

import {
  BASIC_CHAPTER_INFO_COLLECTION,
  Chapter,
  GetBasicChapterList,
  UserChapterReadList,
  UserLastReadChapter,
} from "../models/chapters";
import { OnlyIdList } from "../models/collection";
import {
  GetMangaViewRequest,
  MANGA_DISPLAY_COLLECTION_NAME,
} from "../models/manga";
import { Manga } from "./models/mangas";
import { MangaView, MangaViewFullList } from "./models/mangaViews";
import { UserBookmark } from "./models/userBookmarks";
import {
  UserSavedManga,
  UserSavedMangaExpanded,
  UserSavedMangaExpandedPagedList,
  UserSavedMangaPagedList,
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

async function getMangaViews() {
  const raw = await pb.collection(MANGA_DISPLAY_COLLECTION_NAME).getList();
  return await GetMangaViewRequest.parseAsync(raw);
}

async function getMangaView(id: string) {
  const raw = await pb.collection(MANGA_DISPLAY_COLLECTION_NAME).getOne(id);

  return await MangaView.parseAsync(raw);
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

// TODO(patrik): Move to hooks/

// export function useMangas() {
//   return useQuery({
//     queryKey: ["mangas"],
//     queryFn: getMangaViews,
//   });
// }

// export function useManga(input: { id?: string }) {
//   return useQuery({
//     queryKey: ["manga", input.id],
//     queryFn: async () => await getMangaView(input.id || ""),
//     enabled: !!input.id,
//   });
// }

// export function useMangaChaptersBasic(input: { id?: string }) {
//   return useInfiniteQuery({
//     queryKey: ["basicChapters", input.id],
//     queryFn: async ({ pageParam = 0 }) =>
//       await getMangaChaptersBasic(input.id || "", pageParam),
//     getNextPageParam: (lastPage, _pages) => {
//       const next = lastPage.page + 1;
//       if (next > lastPage.totalPages) {
//         return false;
//       }

//       return next;
//     },
//     enabled: !!input.id,
//   });
// }

// export function useChapter(input: { id?: string }) {
//   return useQuery({
//     queryKey: ["chapters", input.id],
//     queryFn: async () => await getChapter(input.id || ""),
//     enabled: !!input.id,
//   });
// }

// export function useNextChapter(input: { chapter?: Chapter }) {
//   return useQuery({
//     queryKey: ["nextChapters", input.chapter?.id],
//     queryFn: async () => await getNextChapter(input.chapter!),
//     enabled: !!input.chapter,
//   });
// }

// export function usePrevChapter(input: { chapter?: Chapter }) {
//   return useQuery({
//     queryKey: ["prevChapters", input.chapter?.id],
//     queryFn: async () => await getPrevChapter(input.chapter!),
//     enabled: !!input.chapter,
//   });
// }

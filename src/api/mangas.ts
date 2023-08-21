import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";

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
  MangaView,
} from "../models/manga";
import { Manga } from "./models/mangas";
import { MangaViewFullList } from "./models/mangaViews";
import { pb } from "./pocketbase";

export async function fetchMangaViews() {
  const list = await pb.collection("mangaViews").getFullList();
  return await MangaViewFullList.parseAsync(list);
}

export async function fetchSingleManga(mangaId: string) {
  const rec = await pb.collection("mangas").getOne(mangaId);
  return await Manga.parseAsync(rec);
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

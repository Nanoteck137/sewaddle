import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  BASIC_CHAPTER_INFO_COLLECTION,
  Chapter,
  GetBasicChapterList,
  NextChapter,
  PrevChapter,
} from "../models/chapters";
import {
  GetMangaViewRequest,
  MANGA_VIEWS_COLLECTION_NAME,
  MangaView,
} from "../models/manga";
import { pb } from "./pocketbase";

async function getMangaViews() {
  const raw = await pb.collection(MANGA_VIEWS_COLLECTION_NAME).getList();
  return await GetMangaViewRequest.parseAsync(raw);
}

async function getMangaView(id: string) {
  const raw = await pb.collection(MANGA_VIEWS_COLLECTION_NAME).getOne(id);
  console.log("RAW", raw);

  return await MangaView.parseAsync(raw);
}

async function getMangaChaptersBasic(id: string, page: number) {
  const raw = await pb
    .collection(BASIC_CHAPTER_INFO_COLLECTION)
    .getList(page, undefined, {
      filter: `manga = '${id}'`,
    });
  console.log(raw);

  return await GetBasicChapterList.parseAsync(raw);
}

async function getChapter(id: string) {
  let raw = await pb.collection("chapters").getOne(id);
  return Chapter.parseAsync(raw);
}

async function getNextChapter(id: string) {
  let raw = await pb.collection("nextChapters").getOne(id);
  return NextChapter.parseAsync(raw);
}

async function getPrevChapter(id: string) {
  let raw = await pb.collection("prevChapters").getOne(id);
  return PrevChapter.parseAsync(raw);
}

export function useMangas() {
  return useQuery({
    queryKey: ["mangas"],
    queryFn: getMangaViews,
  });
}

export function useManga(input: { id?: string }) {
  return useQuery({
    queryKey: ["manga", input.id],
    queryFn: async () => await getMangaView(input.id || ""),
    enabled: !!input.id,
  });
}

export function useMangaChaptersBasic(input: { id?: string }) {
  return useInfiniteQuery({
    queryKey: ["basicChapters", input.id],
    queryFn: async ({ pageParam = 0 }) =>
      await getMangaChaptersBasic(input.id || "", pageParam),
    getNextPageParam: (lastPage, _pages) => {
      const next = lastPage.page + 1;
      if (next > lastPage.totalPages) {
        return false;
      }

      return next;
    },
    enabled: !!input.id,
  });
}

export function useChapter(input: { id?: string }) {
  return useQuery({
    queryKey: ["chapters", input.id],
    queryFn: async () => await getChapter(input.id || ""),
    enabled: !!input.id,
  });
}

export function useNextChapter(input: { id?: string }) {
  return useQuery({
    queryKey: ["nextChapters", input.id],
    queryFn: async () => await getNextChapter(input.id || ""),
    enabled: !!input.id,
  });
}

export function usePrevChapter(input: { id?: string }) {
  return useQuery({
    queryKey: ["prevChapters", input.id],
    queryFn: async () => await getPrevChapter(input.id || ""),
    enabled: !!input.id,
  });
}

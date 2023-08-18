import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";

import {
  BASIC_CHAPTER_INFO_COLLECTION,
  Chapter,
  GetBasicChapterList,
} from "../models/chapters";
import {
  GetMangaViewRequest,
  MANGA_DISPLAY_COLLECTION_NAME,
  MangaView,
} from "../models/manga";
import { pb } from "./pocketbase";

async function getMangaViews() {
  const raw = await pb.collection(MANGA_DISPLAY_COLLECTION_NAME).getList();
  return await GetMangaViewRequest.parseAsync(raw);
}

async function getMangaView(id: string) {
  const raw = await pb.collection(MANGA_DISPLAY_COLLECTION_NAME).getOne(id);
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

async function getNextChapter(chapter: Chapter) {
  try {
    const rec = await pb
      .collection("chapters")
      .getFirstListItem(`(manga="${chapter.manga}" && idx > ${chapter.idx})`, {
        fields: "id",
      });
    return rec.id;
  } catch (e) {
    if (e instanceof ClientResponseError) {
      return null;
    }

    throw e;
  }
}

async function getPrevChapter(chapter: Chapter) {
  try {
    const rec = await pb
      .collection("chapters")
      .getFirstListItem(`(manga="${chapter.manga}" && idx < ${chapter.idx})`, {
        fields: "id",
      });
    return rec.id;
  } catch (e) {
    if (e instanceof ClientResponseError) {
      return null;
    }

    throw e;
  }
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

export function useNextChapter(input: { chapter?: Chapter }) {
  return useQuery({
    queryKey: ["nextChapters", input.chapter?.id],
    queryFn: async () => await getNextChapter(input.chapter!),
    enabled: !!input.chapter,
  });
}

export function usePrevChapter(input: { chapter?: Chapter }) {
  return useQuery({
    queryKey: ["prevChapters", input.chapter?.id],
    queryFn: async () => await getPrevChapter(input.chapter!),
    enabled: !!input.chapter,
  });
}

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { GetBasicChapterList } from "../models/chapters";
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
  const raw = await pb.collection("chapters").getList(page, undefined, {
    fields: "id,collectionId,collectionName,updated,created,name,index,manga",
    filter: `manga = '${id}'`,
  });
  console.log(raw);

  return await GetBasicChapterList.parseAsync(raw);
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
    queryKey: ["chapters", input.id],
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

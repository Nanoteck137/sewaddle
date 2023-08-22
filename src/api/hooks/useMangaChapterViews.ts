import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMangaChapterViews } from "../chapters";
import { Id } from "../models/base";

export function useMangaChapterViews(input: { mangaId?: Id }) {
  return useInfiniteQuery({
    queryKey: ["mangaChapterViews", input.mangaId],
    queryFn: async ({ pageParam = 0 }) =>
      await fetchMangaChapterViews(input.mangaId!, pageParam),
    getNextPageParam: (lastPage, _pages) => {
      const next = lastPage.page + 1;
      if (next > lastPage.totalPages) {
        return false;
      }

      return next;
    },
    enabled: !!input.mangaId,
  });
}

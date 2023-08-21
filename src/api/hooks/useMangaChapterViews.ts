import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMangaChapterViews } from "../chapters";

export function useMangaChapterViews(input: { mangaId?: string }) {
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

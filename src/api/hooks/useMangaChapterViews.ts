import { useInfiniteQuery } from "@tanstack/react-query";

import { ChapterViewPagedList } from "../models/chapterViews";

export function useMangaChapterViews(input: { mangaId?: string }) {
  return useInfiniteQuery({
    queryKey: ["mangaChapterViews", input.mangaId],
    queryFn: async ({ pageParam = 0 }) =>
      ChapterViewPagedList.parse({
        items: [],
        page: 1,
        perPage: 0,
        totalItems: 0,
        totalPages: 1,
      }),
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

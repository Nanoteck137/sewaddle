import { useQuery } from "@tanstack/react-query";

import { fetchAllMangaChapterIds } from "../chapters";

export function useAllMangaChapterIds(input: { mangaId?: string }) {
  return useQuery({
    queryKey: ["allMangaChapterIds", input.mangaId],
    queryFn: async () => await fetchAllMangaChapterIds(input.mangaId!),
    enabled: !!input.mangaId,
  });
}

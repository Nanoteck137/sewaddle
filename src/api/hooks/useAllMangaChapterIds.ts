import { useQuery } from "@tanstack/react-query";

import { fetchAllMangaChapterIds } from "../chapters";
import { Id } from "../models/base";

export function useAllMangaChapterIds(input: { mangaId?: Id }) {
  return useQuery({
    queryKey: ["allMangaChapterIds", input.mangaId],
    queryFn: async () => await fetchAllMangaChapterIds(input.mangaId!),
    enabled: !!input.mangaId,
  });
}

import { useQuery } from "@tanstack/react-query";

import { fetchMangaViews } from "../mangas";

export function useMangaViews() {
  return useQuery({
    queryKey: ["mangaViews"],
    queryFn: async () => fetchMangaViews(),
  });
}

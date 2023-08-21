import { useQuery } from "@tanstack/react-query";

import { fetchSingleManga } from "../mangas";

export function useManga(input: { mangaId?: string }) {
  return useQuery({
    queryKey: ["mangas", input.mangaId],
    queryFn: async () => fetchSingleManga(input.mangaId!),
    enabled: !!input.mangaId,
  });
}

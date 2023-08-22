import { useQuery } from "@tanstack/react-query";

import { fetchSingleManga } from "../mangas";
import { Id } from "../models/base";

export function useManga(input: { mangaId?: Id }) {
  return useQuery({
    queryKey: ["mangas", input.mangaId],
    queryFn: async () => fetchSingleManga(input.mangaId!),
    enabled: !!input.mangaId,
  });
}

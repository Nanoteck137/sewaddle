import { useQuery } from "@tanstack/react-query";

import { fetchUserBookmark } from "../mangas";

export function useUserBookmark(input: { mangaId?: string }) {
  return useQuery({
    queryKey: ["userBookmark", input.mangaId],
    queryFn: async () => await fetchUserBookmark(input.mangaId!),
    enabled: !!input.mangaId,
  });
}

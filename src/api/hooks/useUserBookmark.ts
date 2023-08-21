import { useQuery } from "@tanstack/react-query";

import { fetchUserBookmark } from "../mangas";

export function useUserBookmark(input: { userId?: string; mangaId?: string }) {
  return useQuery({
    queryKey: ["userBookmarks", input.mangaId],
    queryFn: async () => await fetchUserBookmark(input.userId!, input.mangaId!),
    enabled: !!input.userId && !!input.mangaId,
  });
}

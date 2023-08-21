import { useQuery } from "@tanstack/react-query";

import { fetchUserSavedManga } from "../mangas";

export function useUserSavedManga(input: {
  userId?: string;
  mangaId?: string;
}) {
  return useQuery({
    queryKey: ["userSavedMangas", input.userId, input.mangaId],
    queryFn: async () =>
      await fetchUserSavedManga(input.userId!, input.mangaId!),
    enabled: !!input.userId && !!input.mangaId,
  });
}

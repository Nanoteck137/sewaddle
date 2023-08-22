import { useQuery } from "@tanstack/react-query";

import { fetchUserSavedManga } from "../mangas";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useUserSavedManga(input: { user?: User; mangaId?: Id }) {
  return useQuery({
    queryKey: ["userSavedMangas", input.user?.id, input.mangaId],
    queryFn: async () => await fetchUserSavedManga(input.user!, input.mangaId!),
    enabled: !!input.user && !!input.mangaId,
  });
}

import { useQuery } from "@tanstack/react-query";

import { fetchUserBookmark } from "../mangas";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useUserBookmark(input: { user?: User; mangaId?: Id }) {
  return useQuery({
    queryKey: ["userBookmarks", input.user?.id, input.mangaId],
    queryFn: async () => await fetchUserBookmark(input.user!, input.mangaId!),
    enabled: !!input.user && !!input.mangaId,
  });
}

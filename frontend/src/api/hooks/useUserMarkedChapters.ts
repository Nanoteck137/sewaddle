import { useQuery } from "@tanstack/react-query";

import { fetchUserMarkedChapters } from "../chapters";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useUserMarkedChapters(input: { user?: User; mangaId?: Id }) {
  return useQuery({
    queryKey: ["userMarkedChapters", input.user?.id, input.mangaId],
    queryFn: async () =>
      await fetchUserMarkedChapters(input.user!, input.mangaId!),
    enabled: !!input.user && !!input.mangaId,
  });
}

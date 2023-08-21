import { useQuery } from "@tanstack/react-query";

import { fetchUserMarkedChapters } from "../chapters";

export function useUserMarkedChapters(input: {
  userId?: string;
  mangaId?: string;
}) {
  return useQuery({
    queryKey: ["userMarkedChapters", input.userId, input.mangaId],
    queryFn: async () =>
      await fetchUserMarkedChapters(input.userId!, input.mangaId!),
    enabled: !!input.userId && !!input.mangaId,
  });
}

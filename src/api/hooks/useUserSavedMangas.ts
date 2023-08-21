import { useQuery } from "@tanstack/react-query";

import { fetchUserSavedMangas } from "../mangas";

export function useUserSavedMangas(input: { userId?: string }) {
  return useQuery({
    queryKey: ["userSavedMangas", input.userId],
    queryFn: async () => await fetchUserSavedMangas(input.userId!, 0),
    enabled: !!input.userId,
  });
}

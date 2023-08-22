import { useQuery } from "@tanstack/react-query";

import { fetchUserSavedMangas } from "../mangas";
import { User } from "../models/users";

export function useUserSavedMangas(input: { user?: User }) {
  return useQuery({
    queryKey: ["userSavedMangas", input.user?.id],
    queryFn: async () => await fetchUserSavedMangas(input.user!, 0),
    enabled: !!input.user,
  });
}

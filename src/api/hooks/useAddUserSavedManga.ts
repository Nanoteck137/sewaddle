import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUserSavedManga } from "../mangas";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useAddUserSavedManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user: User; mangaId: Id }) => {
      return await createUserSavedManga(data.user, data.mangaId);
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries([
        "userSavedMangas",
        vars.user.id,
        vars.mangaId,
      ]);
    },
  });
}

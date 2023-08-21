import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeUserSavedManga } from "../mangas";

export function useRemoveUserSavedManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; mangaId: string }) => {
      return await removeUserSavedManga(data.userId, data.mangaId);
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries([
        "userSavedMangas",
        vars.userId,
        vars.mangaId,
      ]);
    },
  });
}

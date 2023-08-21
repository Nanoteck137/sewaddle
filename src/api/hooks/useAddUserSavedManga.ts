import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUserSavedManga } from "../mangas";

export function useAddUserSavedManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; mangaId: string }) => {
      return await createUserSavedManga(data.userId, data.mangaId);
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

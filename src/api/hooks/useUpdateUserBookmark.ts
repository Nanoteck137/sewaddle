import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUserBookmark } from "../chapters";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useUpdateUserBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user: User;
      mangaId: Id;
      chapterId: Id;
      page: number;
    }) =>
      await updateUserBookmark(
        data.user,
        data.mangaId,
        data.chapterId,
        data.page,
      ),
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries([
        "userBookmarks",
        vars.user.id,
        vars.mangaId,
      ]);
    },
  });
}

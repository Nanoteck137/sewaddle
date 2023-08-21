import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUserBookmark } from "../chapters";

export function useUpdateUserBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      mangaId: string;
      chapterId: string;
      page: number;
    }) =>
      await updateUserBookmark(
        data.userId,
        data.mangaId,
        data.chapterId,
        data.page,
      ),
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries([
        "userBookmarks",
        vars.userId,
        vars.mangaId,
      ]);
    },
  });
}

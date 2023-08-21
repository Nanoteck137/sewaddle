import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markUserChapters } from "../chapters";

export function useMarkUserChapters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; chapterIds: string[] }) =>
      await markUserChapters(data.userId, data.chapterIds),
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries(["userMarkedChapters", vars.userId]);
    },
  });
}

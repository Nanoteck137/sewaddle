import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unmarkUserChapters } from "../chapters";

export function useUnmarkUserChapters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; ids: string[] }) =>
      await unmarkUserChapters(data.ids),

    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries(["userMarkedChapters", vars.userId]);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unmarkUserChapters } from "../chapters";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useUnmarkUserChapters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user: User; ids: Id[] }) =>
      await unmarkUserChapters(data.ids),

    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries(["userMarkedChapters", vars.user.id]);
    },
  });
}

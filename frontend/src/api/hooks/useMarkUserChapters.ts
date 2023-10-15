import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markUserChapters } from "../chapters";
import { Id } from "../models/base";
import { User } from "../models/users";

export function useMarkUserChapters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user: User; chapterIds: Id[] }) =>
      await markUserChapters(data.user, data.chapterIds),
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries(["userMarkedChapters", vars.user.id]);
    },
  });
}

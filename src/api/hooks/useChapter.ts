import { useQuery } from "@tanstack/react-query";

import { fetchSingleChapter } from "../chapters";

export function useChapter(input: { chapterId?: string }) {
  return useQuery({
    queryKey: ["chapters", input.chapterId],
    queryFn: async () => await fetchSingleChapter(input.chapterId!),
    enabled: !!input.chapterId,
  });
}

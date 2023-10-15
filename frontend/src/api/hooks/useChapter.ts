import { useQuery } from "@tanstack/react-query";

import { fetchSingleChapter } from "../chapters";
import { Id } from "../models/base";

export function useChapter(input: { chapterId?: Id }) {
  return useQuery({
    queryKey: ["chapters", input.chapterId],
    queryFn: async () => await fetchSingleChapter(input.chapterId!),
    enabled: !!input.chapterId,
  });
}

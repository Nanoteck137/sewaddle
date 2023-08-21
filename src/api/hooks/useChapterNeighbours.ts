import { useQuery } from "@tanstack/react-query";

import { fetchChapterNeighbours } from "../chapters";
import { Chapter } from "../models/chapters";

export function useChapterNeighbours(input: { chapter?: Chapter }) {
  return useQuery({
    queryKey: ["chapterNeighbours", input.chapter?.id],
    queryFn: async () =>
      await fetchChapterNeighbours(input.chapter!.manga, input.chapter!.idx),
    enabled: !!input.chapter,
  });
}

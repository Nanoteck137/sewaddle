import { useQuery } from "@tanstack/react-query";

import {
  GetMangaViewRequest,
  MANGA_VIEWS_COLLECTION_NAME,
} from "../models/manga";
import { pb } from "./pocketbase";

async function getMangaViews() {
  const raw = await pb.collection(MANGA_VIEWS_COLLECTION_NAME).getList();
  return await GetMangaViewRequest.parseAsync(raw);
}

export function useMangaViews() {
  return useQuery({
    queryKey: ["mangaViews"],
    queryFn: getMangaViews,
  });
}

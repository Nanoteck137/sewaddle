import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { ClientResponseError } from "pocketbase";

import { pb } from "../api/pocketbase";
import {
  CHAPTER_RPOGRESS_COLLECTION_NAME,
  ChapterProgress,
} from "../models/chapterProgress";
import { useAuth } from "./useAuth";

const fetch = async (userId: string, chapterId: string) => {
  console.log("FETCH");
  try {
    const rec = await pb
      .collection(CHAPTER_RPOGRESS_COLLECTION_NAME)
      .getFirstListItem(`user = '${userId}' && chapter = '${chapterId}'`, {
        $autoCancel: false,
      });
    return await ChapterProgress.parseAsync(rec);
  } catch (e) {
    if (e instanceof ClientResponseError) {
      if (e.status === 404) {
        return null;
      }

      throw e;
    }
  }
};

const create = async (userId: string, chapterId: string) => {
  console.log("CREATE");
  const rec = await pb.collection(CHAPTER_RPOGRESS_COLLECTION_NAME).create({
    user: userId,
    chapter: chapterId,
    read: false,
    currentPage: 0,
  });
  return await ChapterProgress.parseAsync(rec);
};

const get = async (userId: string, chapterId: string) => {
  const rec = await fetch(userId, chapterId);
  if (!rec) {
    return await create(userId, chapterId);
  }

  return rec;
};

const useChapterProgress = (input: { chapterId?: string }) => {
  const { chapterId } = input;

  const auth = useAuth();

  const query = useQuery({
    queryKey: ["chapterProgress", chapterId, auth.user?.id],
    queryFn: async () => await get(auth.user?.id || "", chapterId || ""),
    enabled: !!chapterId && !!auth.user?.id,
  });

  const pageMutation = useMutation({
    mutationFn: async (page: number) => {
      if (query.data) {
        await pb
          .collection(CHAPTER_RPOGRESS_COLLECTION_NAME)
          .update(query.data.id, {
            currentPage: page,
          });
      }
    },
  });

  const readMutation = useMutation({
    mutationFn: async (read: boolean) => {
      if (query.data) {
        await pb
          .collection(CHAPTER_RPOGRESS_COLLECTION_NAME)
          .update(query.data.id, {
            read,
          });
      }
    },
  });

  const setPage = useCallback(
    (page: number) => {
      pageMutation.mutate(page);
    },
    [query.data],
  );

  const setRead = useCallback(
    (read: boolean) => {
      readMutation.mutate(read);
    },
    [query.data],
  );

  return { data: query.data, setPage, setRead };
};

export default useChapterProgress;
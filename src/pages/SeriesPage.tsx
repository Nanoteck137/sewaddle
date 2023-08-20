import {
  BookmarkIcon,
  BookmarkSlashIcon,
  BookOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import parse from "html-react-parser";
import { forwardRef, Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

import { useManga, useMangaChaptersBasic } from "../api/manga";
import { pb } from "../api/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import { BasicChapter } from "../models/chapters";
import { Collection } from "../models/collection";

const Chapter = forwardRef<
  HTMLAnchorElement,
  {
    chapter: BasicChapter;
    isContinue: boolean;
    hasRead: boolean;
    isGroup: boolean;

    select: (select: boolean) => void;
    showSelectMarker: boolean;
    disableSelectMarker: boolean;
    isSelected: boolean;
  }
>((props, ref) => {
  const {
    chapter,
    isContinue,
    hasRead,
    isGroup,
    isSelected,
    showSelectMarker,
    disableSelectMarker,
    select,
  } = props;

  return (
    <Link
      ref={ref}
      to={`/view/${chapter.id}`}
      className="group relative flex flex-col items-center rounded border-2 shadow dark:border-gray-500 dark:bg-gray-600"
      draggable="false"
      onClick={(e) => {
        if (showSelectMarker) {
          e.preventDefault();
          select(!isSelected);
        }
      }}
    >
      {isGroup && (
        <p className="h-auto flex-grow p-1">
          Ch. {chapter.group} - {chapter.name}
        </p>
      )}
      {!isGroup && <p className="h-auto flex-grow p-1">Ch. {chapter.name}</p>}

      <div className="relative">
        <img
          className=""
          src={pb.getFileUrl(chapter, chapter.cover)}
          draggable="false"
          alt="Chapter Cover"
        />

        {!disableSelectMarker && (
          <button
            className={`absolute left-2 top-2 h-8 w-8 rounded border-2 border-gray-400  bg-black/80 ${
              showSelectMarker ? "" : "hidden group-hover:block"
            }`}
            onClick={(e) => {
              console.log("HELLO?");
              e.stopPropagation();
              e.preventDefault();
              select(!isSelected);
            }}
          >
            {isSelected && <XMarkIcon />}
          </button>
        )}

        <div
          className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full p-1 shadow-xl ${
            isContinue
              ? "bg-yellow-400/95"
              : hasRead
              ? "bg-green-400/95"
              : "bg-red-500/95"
          }`}
        >
          {chapter.pageCount}
        </div>
      </div>
    </Link>
  );
});

const SeriesPage = () => {
  const { id } = useParams();
  const mangaQuery = useManga({ id });
  const mangaChaptersQuery = useMangaChaptersBasic({ id });

  const [ref, inView] = useInView();

  const auth = useAuth();

  const Schema = Collection.extend({
    user: z.string(),
    manga: z.string(),
    chapter: z.string(),
    page: z.number(),
  });

  const lastChapterRead = useQuery({
    queryKey: ["lastChapterRead", auth.user?.id, id],
    queryFn: async () => {
      try {
        const rec = await pb
          .collection("userLastReadChapter")
          .getFirstListItem(`(user = "${auth.user?.id}" && manga = "${id}")`);
        return await Schema.parseAsync(rec);
      } catch (e) {
        return null;
      }
    },
    enabled: !!auth.user?.id && !!id,
  });

  const TestSchema = z.array(
    Collection.extend({
      user: z.string(),
      chapter: z.string(),
    }),
  );

  const chapterRead = useQuery({
    queryKey: ["chapterRead", auth.user?.id, id],
    queryFn: async () => {
      const list = await pb.collection("userChapterRead").getFullList({
        filter: `user = "${auth.user?.id}" && chapter.manga = "${id}"`,
      });
      return await TestSchema.parseAsync(list);
    },
    enabled: !!auth.user?.id && !!id,
  });

  const mangaSaved = useQuery({
    queryKey: ["mangaSaved", auth.user?.id, id],
    queryFn: async () => {
      try {
        const rec = await pb
          .collection("userMangaSaved")
          .getFirstListItem(`user = "${auth.user?.id}" && manga = "${id}"`);
        return rec.id;
      } catch (e) {
        return null;
      }
    },
    enabled: !!auth.user?.id && !!id,
  });
  console.log(mangaSaved.data);

  const queryClient = useQueryClient();
  const saveManga = useMutation({
    mutationFn: async () => {
      if (auth.user && id) {
        await pb.collection("userMangaSaved").create({
          user: auth.user?.id,
          manga: id,
        });
      }
    },

    onSettled: () => {
      if (auth.user && id) {
        queryClient.invalidateQueries(["mangaSaved", auth.user.id, id]);
      }
    },
  });

  const removeManga = useMutation({
    mutationFn: async () => {
      if (mangaSaved.data) {
        await pb.collection("userMangaSaved").delete(mangaSaved.data);
      }
    },

    onSettled: () => {
      if (auth.user && id) {
        queryClient.invalidateQueries(["mangaSaved", auth.user.id, id]);
      }
    },
  });

  useEffect(() => {
    if (inView && mangaChaptersQuery.hasNextPage) {
      mangaChaptersQuery.fetchNextPage();
    }
  }, [
    inView,
    mangaChaptersQuery.hasNextPage,
    mangaChaptersQuery.fetchNextPage,
  ]);

  const [collapsed, setCollapsed] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const allChapterIds = useQuery({
    queryKey: ["allChapterIds", id],
    queryFn: async () => {
      const recs = await pb
        .collection("chapters")
        .getFullList({ filter: `manga = "${id}"` });
      return await z.array(Collection.pick({ id: true })).parseAsync(recs);
    },
    select: (data) => data.map((i) => i.id),
    enabled: !!id,
  });

  const markItems = useMutation({
    mutationFn: async (input: { items: string[]; markAsRead: boolean }) => {
      if (auth.user) {
        if (input.markAsRead) {
          const promises = input.items.map((id) => {
            return pb.collection("userChapterRead").create(
              {
                user: auth.user.id,
                chapter: id,
              },
              { $autoCancel: false },
            );
          });

          await Promise.all(promises);
        }
      }
    },

    onSuccess: () => {
      setSelectedItems([]);
    },

    onSettled: () => {
      if (auth.user) {
        queryClient.invalidateQueries(["chapterRead", auth.user.id, id]);
      }
    },
  });

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  return (
    <div className="flex flex-col gap-4 p-2">
      <p className="text-center text-2xl">{manga.englishTitle}</p>
      <div className="grid grid-cols-1 place-items-center md:grid-cols-3 md:place-items-start">
        <div className="flex w-full items-center justify-center">
          <img
            className="shadow-xl"
            src={pb.getFileUrl(manga, manga.coverExtraLarge)}
            alt=""
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2 p-2 md:items-start">
          <p
            className={`whitespace-pre-wrap ${collapsed ? "line-clamp-6" : ""}`}
          >
            {parse(manga.description)}
          </p>
          <button
            className="text-gray-500 dark:text-gray-300"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? "Show more" : "Show less"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {lastChapterRead.data && (
            <Link
              className="w-fit rounded bg-red-300 px-4 py-2"
              to={`/view/${lastChapterRead.data.chapter}?page=${lastChapterRead.data.page}`}
            >
              Continue
            </Link>
          )}
          {!mangaSaved.data && (
            <button
              className="rounded bg-red-300 px-4 py-2 disabled:bg-green-300"
              disabled={saveManga.isLoading}
              onClick={() => {
                saveManga.mutate();
              }}
            >
              Save Manga
            </button>
          )}
          {mangaSaved.data && (
            <button
              className="rounded bg-red-300 px-4 py-2 disabled:bg-green-300"
              disabled={removeManga.isLoading}
              onClick={() => {
                removeManga.mutate();
              }}
            >
              Remove Manga
            </button>
          )}
          <button
            className="rounded bg-red-300 px-4 py-2 disabled:bg-green-300"
            onClick={() => {
              if (allChapterIds.data) setSelectedItems(allChapterIds.data);
            }}
          >
            Mark all chapters
          </button>
        </div>
        <p>Chapters Available: {manga.chaptersAvailable}</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {chapters.pages.map((page, i) => {
            const isLastPage = i == chapters.pages.length - 1;
            return (
              <Fragment key={i}>
                {page.items.map((item, i) => {
                  const isLastItem = i == page.items.length - 1;

                  let hasReadChapter = false;
                  if (chapterRead.data) {
                    const data = chapterRead.data.find(
                      (obj) => obj.chapter == item.id,
                    );

                    if (data) {
                      hasReadChapter = true;
                    }
                  }

                  const isContinue = lastChapterRead.data?.chapter === item.id;

                  const select = (select: boolean) => {
                    if (!auth.user) {
                      return;
                    }

                    console.log("Select");
                    if (select) {
                      setSelectedItems((prev) => [...prev, item.id]);
                    } else {
                      setSelectedItems((prev) => [
                        ...prev.filter((i) => i !== item.id),
                      ]);
                    }
                  };

                  const showSelectMarker = selectedItems.length > 0;
                  const selected = !!selectedItems.find((i) => i === item.id);

                  if (isLastPage && isLastItem) {
                    return (
                      <Chapter
                        ref={ref}
                        key={item.id}
                        chapter={item}
                        isContinue={isContinue}
                        hasRead={hasReadChapter}
                        isGroup={manga.isGroup}
                        isSelected={selected}
                        showSelectMarker={showSelectMarker}
                        select={select}
                        disableSelectMarker={!auth.user}
                      />
                    );
                  }
                  return (
                    <Chapter
                      key={item.id}
                      chapter={item}
                      isContinue={isContinue}
                      hasRead={hasReadChapter}
                      isGroup={manga.isGroup}
                      isSelected={selected}
                      showSelectMarker={showSelectMarker}
                      select={select}
                      disableSelectMarker={!auth.user}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>

        {selectedItems.length > 0 && (
          <div className="fixed bottom-10 left-1/2 flex -translate-x-1/2 items-center rounded bg-red-300">
            <button onClick={() => setSelectedItems([])}>
              <XMarkIcon className="h-7 w-7" />
            </button>
            <p>{selectedItems.length} item(s) selected</p>
            {selectedItems.length === 1 && (
              <button>
                <BookOpenIcon className="h-7 w-7" />
              </button>
            )}
            <button
              onClick={() => {
                const items = selectedItems.filter((id) => {
                  if (chapterRead.data) {
                    return !chapterRead.data.find((i) => i.chapter === id);
                  } else {
                    return false;
                  }
                });

                markItems.mutate({ items, markAsRead: true });
              }}
            >
              <BookmarkIcon className="h-7 w-7" />
            </button>
            <button
              onClick={() => {
                markItems.mutate({ items: selectedItems, markAsRead: false });
              }}
            >
              <BookmarkSlashIcon className="h-7 w-7" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;

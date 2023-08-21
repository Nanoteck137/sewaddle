import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  AdjustmentsVerticalIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  BookOpenIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  StarIcon as StarSolidIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import parse from "html-react-parser";
import { forwardRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

import {
  useAllMangaChapterIds,
  useManga,
  useMangaChapterViews,
  useUserBookmark,
  useUserMarkedChapters,
  useUserSavedManga,
} from "../api";
import { pb } from "../api/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import { BasicChapter } from "../models/chapters";
import { Collection } from "../models/collection";

type ChapterProps = {
  chapter: BasicChapter;
  isContinue: boolean;
  hasRead: boolean;
  isGroup: boolean;

  select: (select: boolean, shift: boolean) => void;
  showSelectMarker: boolean;
  disableSelectMarker: boolean;
  isSelected: boolean;
};

const Chapter = forwardRef<HTMLAnchorElement, ChapterProps>((props, ref) => {
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
      className={`group relative flex flex-col items-center rounded border-2 shadow dark:border-gray-500 dark:bg-gray-600 ${
        showSelectMarker ? "select-none" : ""
      }`}
      draggable="false"
      onClick={(e) => {
        if (showSelectMarker) {
          e.preventDefault();
          select(!isSelected, e.shiftKey);
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
              e.stopPropagation();
              e.preventDefault();
              select(!isSelected, e.shiftKey);
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

const SmallChapterItem = forwardRef<HTMLAnchorElement, ChapterProps>(
  (props, ref) => {
    const {
      chapter,
      hasRead,
      isGroup,
      isContinue,
      showSelectMarker,
      select,
      isSelected,
      disableSelectMarker,
    } = props;

    return (
      <Link
        className={`flex justify-between border-b-2 py-1 last:border-none dark:border-gray-500 ${
          showSelectMarker ? "select-none" : ""
        }`}
        ref={ref}
        to={`/view/${chapter.id}`}
        draggable="false"
        onClick={(e) => {
          if (showSelectMarker) {
            e.preventDefault();
            select(!isSelected, e.shiftKey);
          }
        }}
      >
        <div className="flex gap-2">
          <p className="w-12 text-right">{chapter.idx}.</p>
          <img
            className="h-16 w-12 rounded border object-cover dark:border-gray-500"
            src={pb.getFileUrl(chapter, chapter.cover)}
            alt=""
          />
          <div className="flex flex-col justify-between">
            {!isGroup && <p>Ch. {chapter.name}</p>}
            {isGroup && (
              <p>
                Ch. {chapter.group} - {chapter.name}
              </p>
            )}
            {!disableSelectMarker && (
              <div className="flex gap-2">
                {hasRead && <p>Read</p>}
                {isContinue && <p>Current</p>}
              </div>
            )}
          </div>
        </div>
        {!disableSelectMarker && (
          <div className="flex items-center gap-4 p-4">
            {!showSelectMarker && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <EllipsisVerticalIcon className="h-6 w-6" />
              </button>
            )}
            <button
              className="h-6 w-6 rounded border-2 border-black dark:border-white"
              onClick={(e) => {
                e.preventDefault();
                select(!isSelected, e.shiftKey);
              }}
            >
              {isSelected && <CheckIcon className="" />}
            </button>
          </div>
        )}
      </Link>
    );
  },
);

const SeriesPage = () => {
  const { id } = useParams();

  const queryClient = useQueryClient();

  const mangaQuery = useManga({ mangaId: id });
  const mangaChaptersQuery = useMangaChapterViews({ mangaId: id });

  const [ref, inView] = useInView();
  const auth = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const chapterIds = useAllMangaChapterIds({ mangaId: id });

  const userBookmark = useUserBookmark({ mangaId: id });
  const userMarkedChapters = useUserMarkedChapters({
    userId: auth.user?.id,
    mangaId: id,
  });

  const userSavedManga = useUserSavedManga({
    userId: auth.user?.id,
    mangaId: id,
  });

  // const saveManga = useMutation({
  //   mutationFn: async () => {
  //     if (auth.user && id) {
  //       await createUserMangaSaved(auth.user.id, id);
  //     }
  //   },
  //   onSettled: () => {
  //     if (auth.user && id) {
  //       queryClient.invalidateQueries(["mangaSaved", auth.user.id, id]);
  //     }
  //   },
  // });

  // const removeManga = useMutation({
  //   mutationFn: async () => {
  //     if (mangaSaved.data) {
  //       await deleteUserMangaSaved(mangaSaved.data);
  //     }
  //   },
  //   onSettled: () => {
  //     if (auth.user && id) {
  //       queryClient.invalidateQueries(["mangaSaved", auth.user.id, id]);
  //     }
  //   },
  // });

  useEffect(() => {
    if (inView && mangaChaptersQuery.hasNextPage) {
      mangaChaptersQuery.fetchNextPage();
    }
  }, [
    inView,
    mangaChaptersQuery.hasNextPage,
    mangaChaptersQuery.fetchNextPage,
  ]);

  // const allChapterIds = useQuery({
  //   queryKey: ["allChapterIds", id],
  //   queryFn: async () => fetchAllChapterIds(id!),
  //   select: (data) => data.map((i) => i.id),
  //   enabled: !!id,
  // });

  // const markItems = useMutation({
  //   mutationFn: async (input: { items: string[]; markAsRead: boolean }) => {
  //     if (auth.user) {
  //       if (input.markAsRead) {
  //         const promises = input.items.map((id) => {
  //           return createUserChapterRead(auth.user.id, id);
  //         });
  //         await Promise.all(promises);
  //       } else {
  //         const promises = input.items.map((id) => {
  //           return deleteUserMangaSaved(id);
  //         });
  //         await Promise.all(promises);
  //       }
  //     }
  //   },

  //   onSuccess: () => {
  //     setSelectedItems([]);
  //   },

  //   onSettled: () => {
  //     if (auth.user) {
  //       queryClient.invalidateQueries(["chapterRead", auth.user.id, id]);
  //     }
  //   },
  // });

  // const markItemCurrent = useMutation({
  //   mutationFn: async (itemId: string) => {
  //     try {
  //       if (lastChapterRead.data) {
  //         await updateUserLastReadChapter(lastChapterRead.data.id, itemId, 0);
  //       } else if (lastChapterRead.data === null && auth.user && id) {
  //         await createUserLastReadChapter(auth.user.id, id, itemId, 0);
  //       }
  //     } catch (e) {}
  //   },

  //   onSuccess: () => {
  //     setSelectedItems([]);
  //   },

  //   onSettled: () => {
  //     if (auth.user && id) {
  //       queryClient.invalidateQueries(["lastChapterRead", auth.user?.id, id]);
  //     }
  //   },
  // });

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  const chapterItems = chapters.pages.map((i) => i.items).flat();

  return (
    <div className="flex flex-col gap-4 p-2">
      <p className="text-center text-2xl">{manga.englishTitle}</p>
      <div className="grid grid-cols-1 place-items-center md:grid-cols-3 md:place-items-start">
        <div className="flex w-full justify-center">
          <div className="flex w-max flex-col gap-2">
            <img
              className="w-max rounded border shadow-xl dark:border-gray-500"
              src={pb.getFileUrl(manga, manga.coverExtraLarge)}
              alt=""
            />
            <div className="grid grid-cols-2 gap-2">
              <Link
                className="rounded bg-[#3577ff] px-4 py-2 text-center text-white"
                to={manga.malUrl}
                target="_blank"
              >
                MAL
              </Link>
              <Link
                className="rounded bg-[#3577ff] px-4 py-2 text-center text-white"
                to={manga.anilistUrl}
                target="_blank"
              >
                Anilist
              </Link>
              {userSavedManga.data && (
                <button
                  className="col-span-2 flex items-center justify-center gap-2 rounded bg-gray-200 px-4 py-2 text-black dark:bg-gray-500 dark:text-white"
                  onClick={() => {
                    // removeManga.mutate();
                  }}
                >
                  <StarSolidIcon className="h-6 w-6" />
                  <p>Saved</p>
                </button>
              )}
              {!userSavedManga.data && (
                <button
                  className="col-span-2 flex items-center justify-center gap-2 rounded bg-gray-700 px-4 py-2 text-white dark:bg-gray-100 dark:text-black"
                  onClick={() => {
                    // saveManga.mutate();
                  }}
                >
                  <StarOutlineIcon className="h-6 w-6" />
                  <p>Save</p>
                </button>
              )}
            </div>
          </div>
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
      <div className="flex flex-col">
        <div className="flex h-20 items-center justify-between border-b-2 px-4 dark:border-gray-500">
          {chapterIds.data && (
            <p className="text-lg">
              {chapterIds.data.length} chapter(s) available
            </p>
          )}
          <div className="flex items-center gap-4">
            <button className="h-6 w-6">
              <AdjustmentsVerticalIcon />
            </button>
            <button
              className="h-6 w-6 rounded border-2 border-black dark:border-white"
              onClick={() => {
                // if (allChapterIds.data) {
                //   if (selectedItems.length >= allChapterIds.data.length) {
                //     setSelectedItems([]);
                //   } else {
                //     setSelectedItems(allChapterIds.data);
                //   }
                // }
              }}
            >
              {/* {allChapterIds.data &&
                selectedItems.length >= allChapterIds.data.length && (
                  <CheckIcon />
                )} */}
            </button>
          </div>
        </div>
        {/* <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {chapterItems.map((item, i) => {
            const isViewItem = i == chapterItems.length - 1;
            let hasReadChapter = !!chapterRead.data?.find(
              (obj) => obj.chapter == item.id,
            );
            const isContinue = lastChapterRead.data?.chapter === item.id;
            const select = (select: boolean, shift: boolean) => {
              if (!auth.user) {
                return;
              }
              console.log("Select");
              if (select) {
                if (shift) {
                  const firstSelected = selectedItems[0];
                  let first = chapterItems.findIndex(
                    (i) => i.id === firstSelected,
                  );
                  let last = i;
                  if (first > last) {
                    let tmp = last;
                    last = first;
                    first = tmp;
                  }
                  console.log("First last", first, last);
                  let items = [];
                  let numItems = last - first + 1;
                  console.log("Num", numItems);
                  for (let i = 0; i < numItems; i++) {
                    items.push(first + i);
                  }
                  console.log(items);
                  const ids = items.map((i) => chapterItems[i].id);
                  setSelectedItems(ids);
                } else {
                  setSelectedItems((prev) => [...prev, item.id]);
                }
              } else {
                setSelectedItems((prev) => [
                  ...prev.filter((i) => i !== item.id),
                ]);
              }
            };
            const showSelectMarker = selectedItems.length > 0;
            const selected = !!selectedItems.find((i) => i === item.id);
            return (
              <Chapter
                ref={isViewItem ? ref : undefined}
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
        </div> */}
        <div className="flex flex-col">
          {chapterItems.map((item, i) => {
            const isViewItem = i == chapterItems.length - 1;

            let hasReadChapter = !!userMarkedChapters.data?.find(
              (obj) => obj.chapter == item.id,
            );
            const isContinue = userBookmark.data?.chapter === item.id;
            const select = (select: boolean, shift: boolean) => {
              if (!auth.user) {
                return;
              }
              if (select) {
                if (shift) {
                  const firstSelected = selectedItems[0];
                  let first = chapterItems.findIndex(
                    (i) => i.id === firstSelected,
                  );
                  let last = i;
                  if (first > last) {
                    let tmp = last;
                    last = first;
                    first = tmp;
                  }
                  let items = [];
                  let numItems = last - first + 1;
                  for (let i = 0; i < numItems; i++) {
                    items.push(first + i);
                  }
                  const ids = items.map((i) => chapterItems[i].id);
                  setSelectedItems(ids);
                } else {
                  setSelectedItems((prev) => [...prev, item.id]);
                }
              } else {
                setSelectedItems((prev) => [
                  ...prev.filter((i) => i !== item.id),
                ]);
              }
            };
            const showSelectMarker = selectedItems.length > 0;
            const selected = !!selectedItems.find((i) => i === item.id);
            return (
              <SmallChapterItem
                ref={isViewItem ? ref : undefined}
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
        </div>
        {selectedItems.length > 0 && (
          // TODO(patrik): Make the disable the buttons then doing
          // the mutation
          <div className="fixed bottom-14 left-4 right-4 flex items-center justify-around gap-2 rounded border-2 bg-white px-0 py-3 shadow dark:border-gray-500 dark:bg-gray-600 md:left-1/2 md:right-auto md:-translate-x-1/2 md:justify-between md:px-8">
            <button onClick={() => setSelectedItems([])}>
              <XMarkIcon className="h-7 w-7" />
            </button>
            <p className="px-4">{selectedItems.length} item(s) selected</p>
            <div className="flex gap-2">
              {selectedItems.length === 1 && (
                <button
                  onClick={() => {
                    // markItemCurrent.mutate(selectedItems[0]);
                  }}
                >
                  <BookOpenIcon className="h-7 w-7" />
                </button>
              )}
              <button
                onClick={() => {
                  // const items = selectedItems.filter((id) => {
                  //   if (chapterRead.data) {
                  //     return !chapterRead.data.find((i) => i.chapter === id);
                  //   } else {
                  //     return false;
                  //   }
                  // });
                  // markItems.mutate({ items, markAsRead: true });
                }}
              >
                <BookmarkIcon className="h-7 w-7" />
              </button>
              <button
                onClick={() => {
                  // if (!chapterRead.data) {
                  //   return;
                  // }
                  // const items = chapterRead.data
                  //   .filter((item) => {
                  //     return selectedItems.find((i) => i === item.chapter);
                  //   })
                  //   .map((item) => item.id);
                  // markItems.mutate({ items, markAsRead: false });
                }}
              >
                <BookmarkSlashIcon className="h-7 w-7" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesPage;

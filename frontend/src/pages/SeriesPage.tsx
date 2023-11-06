import { Popover } from "@headlessui/react";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  AdjustmentsVerticalIcon,
  BookOpenIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  StarIcon as StarSolidIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import parse from "html-react-parser";
import { forwardRef, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiEndpoint } from "@/App";
import Button, { buttonVarients } from "@/components/ui/Button";
import { cn } from "@/lib/util";
import { RouterOutput, trpc } from "@/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useAuth } from "../contexts/AuthContext";

type Chapter = RouterOutput["manga"]["getChapters"][number];

type ChapterProps = {
  chapter: Chapter;
  isContinue: boolean;
  hasRead: boolean;

  showSelectMarker: boolean;
  disableSelectMarker: boolean;
  isSelected: boolean;

  select: (select: boolean, shift: boolean) => void;
  mark: () => void;
  unmark: () => void;
  setAsCurrent: () => void;
};

// eslint-disable-next-line react/display-name
const ChapterItem = forwardRef<HTMLDivElement, ChapterProps>((props, ref) => {
  const {
    chapter,
    hasRead,
    isContinue,
    showSelectMarker,
    isSelected,
    disableSelectMarker,
    select,
    mark,
    unmark,
    setAsCurrent,
  } = props;

  const navigate = useNavigate();

  return (
    <div
      className={`relative flex justify-between border-b-2 py-1 last:border-none dark:border-gray-500 ${
        showSelectMarker ? "select-none" : ""
      }`}
      ref={ref}
    >
      <div
        className="group relative flex flex-grow cursor-pointer gap-2"
        onClick={() => {
          navigate(`/view/${chapter.mangaId}/${chapter.index}`);
        }}
      >
        <p className="w-12 text-right">{chapter.index}.</p>
        <img
          className="h-16 w-12 rounded border object-cover dark:border-gray-500"
          src={`${apiEndpoint}${chapter.cover}`}
          alt=""
          loading="lazy"
        />
        <div className="flex flex-col justify-between">
          <p className="group-hover:underline">{chapter.name}</p>
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
            <Popover className="relative">
              <Popover.Button className="flex items-center rounded-full p-1 hover:bg-black/20">
                <EllipsisVerticalIcon className="h-6 w-6" />
              </Popover.Button>
              <Popover.Panel className="absolute right-0 z-[1000] flex w-56 flex-col gap-0 overflow-hidden rounded border-2 border-gray-500 bg-gray-600 hover:bg-red-300">
                {({ close }) => (
                  <>
                    {!hasRead && (
                      <button
                        className="flex gap-2 border-gray-500 bg-gray-600 p-2 text-start hover:bg-gray-500 [&:not(:last-child)]:border-b"
                        onClick={() => {
                          mark();
                          close();
                        }}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                        <p>Mark as Read</p>
                      </button>
                    )}
                    {hasRead && (
                      <button
                        className="flex gap-2 border-gray-500 bg-gray-600 p-2 text-start hover:bg-gray-500 [&:not(:last-child)]:border-b"
                        onClick={() => {
                          unmark();
                          close();
                        }}
                      >
                        <BookmarkSlashIcon className="h-5 w-5" />
                        <p>Mark as Unread</p>
                      </button>
                    )}
                    {!isContinue && (
                      <button
                        className="flex gap-2 bg-gray-600 p-2 hover:bg-gray-500"
                        onClick={() => {
                          setAsCurrent();
                          close();
                        }}
                      >
                        <PaperClipIcon className="h-5 w-5" />
                        <p>Set as current</p>
                      </button>
                    )}
                  </>
                )}
              </Popover.Panel>
            </Popover>
          )}
          <button
            className="h-6 w-6 rounded border-2 border-black dark:border-white"
            onClick={(e) => {
              select(!isSelected, e.shiftKey);
            }}
          >
            {isSelected && <CheckIcon className="" />}
          </button>
        </div>
      )}
    </div>
  );
});

const SeriesPage = () => {
  const { id } = useParams();

  const queryClient = useQueryClient();

  const manga = trpc.manga.get.useQuery(
    { mangaId: id || "" },
    { enabled: !!id },
  );

  const chapters = trpc.manga.getChapters.useQuery(
    { mangaId: id || "" },
    { enabled: !!id },
  );

  const auth = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const markChapters = trpc.manga.markChapters.useMutation({
    onSuccess: async () => {
      if (manga.data) {
        const queryKey = getQueryKey(trpc.manga.getChapters, {
          mangaId: manga.data.id,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  const unmarkChapters = trpc.manga.unmarkChapters.useMutation({
    onSuccess: () => {
      if (manga.data) {
        const queryKey = getQueryKey(trpc.manga.getChapters, {
          mangaId: manga.data.id,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  const updateBookmark = trpc.manga.updateUserBookmark.useMutation({
    onSuccess: () => {
      if (manga.data) {
        const queryKey = getQueryKey(trpc.manga.getChapters, {
          mangaId: manga.data.id,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  const saveManga = trpc.manga.userSaveManga.useMutation({
    onSuccess: () => {
      if (manga.data) {
        const queryKey = getQueryKey(trpc.manga.get, {
          mangaId: manga.data.id,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
  });

  useEffect(() => {
    if (markChapters.isSuccess || unmarkChapters.isSuccess) {
      setSelectedItems([]);
    }
  }, [markChapters.isSuccess, unmarkChapters.isSuccess]);

  if (manga.isError || chapters.isError) return <p>Error</p>;
  if (manga.isLoading || chapters.isLoading) return <p>Loading...</p>;

  const chapterItems = chapters.data;
  const chapterIds = manga.data.chapters;

  const userMarkedChapters = chapters.data
    .filter((c) => c.user?.read)
    .map((c) => c.index);

  return (
    <div className="flex flex-col gap-4 p-2">
      <p className="border-b border-gray-500 pb-2 text-center text-2xl">
        {manga.data.title}
      </p>
      <div className="grid grid-cols-1 place-items-center md:grid-cols-3 md:place-items-start">
        <div className="flex w-full justify-center">
          <div className="flex w-max flex-col gap-2">
            <img
              className="w-max rounded border shadow-xl dark:border-gray-500"
              src={`${apiEndpoint}${manga.data.cover}`}
              alt=""
            />
            <div className="grid grid-cols-2 gap-2">
              <Link
                className={cn(
                  buttonVarients({ variant: "secondary", size: "md" }),
                )}
                to={`https://myanimelist.net/manga/${manga.data.malId}`}
                target="_blank"
              >
                MAL
              </Link>
              <Link
                className={cn(
                  buttonVarients({ variant: "secondary", size: "md" }),
                )}
                to={`https://anilist.co/manga/${manga.data.anilistId}`}
                target="_blank"
              >
                Anilist
              </Link>
              {manga.data.user &&
                (manga.data.user.saved ? (
                  <Button
                    className="col-span-2"
                    onClick={() => {
                      saveManga.mutate({
                        mangaId: manga.data.id,
                        unsave: true,
                      });
                    }}
                  >
                    <StarSolidIcon className="h-6 w-6" />
                    <p>Saved</p>
                  </Button>
                ) : (
                  <Button
                    className="col-span-2"
                    onClick={() => {
                      saveManga.mutate({ mangaId: manga.data.id });
                    }}
                  >
                    <StarOutlineIcon className="h-6 w-6" />
                    <p>Save</p>
                  </Button>
                ))}
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-2 px-2 md:items-start">
          {manga.data.description && (
            <>
              <span
                className={`whitespace-pre-wrap ${
                  collapsed ? "line-clamp-6" : ""
                }`}
              >
                {parse(manga.data.description)}
              </span>
              <button
                className="text-gray-500 dark:text-gray-300"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                {collapsed ? "Show more" : "Show less"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex h-20 items-center justify-between border-b-2 px-4 dark:border-gray-500">
          <p className="text-lg">
            {manga.data.chapters.length} chapter(s) available
          </p>
          <div className="flex items-center gap-4">
            <button className="h-6 w-6">
              <AdjustmentsVerticalIcon />
            </button>
            {auth.isLoggedIn && (
              <button
                className="h-6 w-6 rounded border-2 border-black dark:border-white"
                onClick={() => {
                  if (selectedItems.length >= chapterIds.length) {
                    setSelectedItems([]);
                  } else {
                    setSelectedItems(chapterIds.map((i) => i.index));
                  }
                }}
              >
                {selectedItems.length >= chapterIds.length && <CheckIcon />}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {chapters.data.map((item, i) => {
            const hasReadChapter = !!item.user?.read;
            const isContinue = item.user?.bookmark !== null;

            const select = (select: boolean, shift: boolean) => {
              if (!auth.user) {
                return;
              }

              if (select) {
                if (shift) {
                  const firstSelected = selectedItems[0];
                  let first = chapterItems.findIndex(
                    (i) => i.index === firstSelected,
                  );

                  let last = i;
                  if (first > last) {
                    const tmp = last;
                    last = first;
                    first = tmp;
                  }

                  const items = [];
                  const numItems = last - first + 1;
                  for (let i = 0; i < numItems; i++) {
                    items.push(first + i);
                  }

                  const ids = items.map((i) => chapterItems[i].index);
                  setSelectedItems(ids);
                } else {
                  setSelectedItems((prev) => [...prev, item.index]);
                }
              } else {
                setSelectedItems((prev) => [
                  ...prev.filter((i) => i !== item.index),
                ]);
              }
            };

            const mark = () => {
              // if (!auth.user) {
              //   return;
              // }
              // markItems.mutate({ user: auth.user, chapterIds: [item.id] });
              markChapters.mutate({
                mangaId: manga.data.id,
                chapters: [item.index],
              });
            };

            const unmark = () => {
              // if (!auth.user || !userMarkedChapters.data) {
              //   return;
              // }
              const index = userMarkedChapters.find((i) => i === item.index);
              if (index) {
                // unmarkItems.mutate({ user: auth.user, ids: [id.id] });
                unmarkChapters.mutate({
                  mangaId: manga.data.id,
                  chapters: [index],
                });
              }
            };

            const setAsCurrent = () => {
              if (manga.data) {
                updateBookmark.mutate({
                  mangaId: manga.data.id,
                  chapterIndex: item.index,
                  page: 0,
                });
              }
            };

            const showSelectMarker = selectedItems.length > 0;
            const selected = !!selectedItems.find((i) => i === item.index);

            return (
              <ChapterItem
                key={item.index}
                chapter={item}
                isContinue={isContinue}
                hasRead={hasReadChapter}
                isSelected={selected}
                showSelectMarker={showSelectMarker}
                disableSelectMarker={!auth.user}
                select={select}
                mark={mark}
                unmark={unmark}
                setAsCurrent={setAsCurrent}
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
                    if (manga.data) {
                      updateBookmark.mutate({
                        mangaId: manga.data.id,
                        chapterIndex: selectedItems[0],
                        page: 0,
                      });
                    }
                    // markItemCurrent.mutate(selectedItems[0]);
                  }}
                >
                  <BookOpenIcon className="h-7 w-7" />
                </button>
              )}
              <button
                onClick={() => {
                  if (manga.data) {
                    const items = selectedItems.filter((index) => {
                      return !userMarkedChapters.find((i) => i === index);
                    });
                    if (items.length > 0) {
                      markChapters.mutate({
                        mangaId: manga.data.id,
                        chapters: items,
                      });
                    }
                  }
                }}
              >
                <BookmarkIcon className="h-7 w-7" />
              </button>
              <button
                onClick={() => {
                  if (manga.data) {
                    const items = userMarkedChapters
                      .filter((item) => {
                        return selectedItems.find((i) => i === item);
                      })
                      .map((item) => item);
                    if (items.length > 0) {
                      unmarkChapters.mutate({
                        mangaId: manga.data.id,
                        chapters: items,
                      });
                    }
                  }
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

import { Popover } from "@headlessui/react";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import {
  AdjustmentsVerticalIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  BookOpenIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  StarIcon as StarSolidIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import parse from "html-react-parser";
import { forwardRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ChapterView } from "@/api/models/chapterViews";
import Button, { buttonVarients } from "@/components/ui/Button";
import { cn } from "@/lib/util";
import {
  useAddUserSavedManga,
  useAllMangaChapterIds,
  useManga,
  useMangaChapterViews,
  useMarkUserChapters,
  useRemoveUserSavedManga,
  useUnmarkUserChapters,
  useUpdateUserBookmark,
  useUserBookmark,
  useUserMarkedChapters,
  useUserSavedManga,
} from "../api";
import { pb } from "../api/pocketbase";
import { useAuth } from "../contexts/AuthContext";

type ChapterProps = {
  chapter: ChapterView;
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
          navigate(`/view/${chapter.id}`);
        }}
      >
        <p className="w-12 text-right">{chapter.idx}.</p>
        <img
          className="h-16 w-12 rounded border object-cover dark:border-gray-500"
          src={pb.getFileUrl(chapter, chapter.cover)}
          alt=""
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

  const mangaQuery = useManga({ mangaId: id });
  const mangaChaptersQuery = useMangaChapterViews({ mangaId: id });

  const [ref, inView] = useInView();
  const auth = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const chapterIds = useAllMangaChapterIds({ mangaId: id });

  const userBookmark = useUserBookmark({
    user: auth.user,
    mangaId: id,
  });
  const userMarkedChapters = useUserMarkedChapters({
    user: auth.user,
    mangaId: id,
  });

  const userSavedManga = useUserSavedManga({
    user: auth.user,
    mangaId: id,
  });

  const addUserSavedManga = useAddUserSavedManga();
  const removeUserSavedManga = useRemoveUserSavedManga();

  useEffect(() => {
    if (inView && mangaChaptersQuery.hasNextPage) {
      mangaChaptersQuery.fetchNextPage();
    }
  }, [
    inView,
    mangaChaptersQuery.hasNextPage,
    mangaChaptersQuery.fetchNextPage,
  ]);

  const markItems = useMarkUserChapters();
  const unmarkItems = useUnmarkUserChapters();

  const updateBookmark = useUpdateUserBookmark();

  useEffect(() => {
    if (markItems.isSuccess || unmarkItems.isSuccess) {
      setSelectedItems([]);
    }
  }, [markItems.isSuccess, unmarkItems.isSuccess]);

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  const chapterItems = chapters.pages.map((i) => i.items).flat();

  return (
    <div className="flex flex-col gap-4 p-2">
      <p className="text-center text-2xl pb-2 border-b border-gray-500">
        {manga.englishTitle}
      </p>
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
                className={cn(
                  buttonVarients({ variant: "secondary", size: "md" }),
                )}
                to={manga.malUrl}
                target="_blank"
              >
                MAL
              </Link>
              <Link
                className={cn(
                  buttonVarients({ variant: "secondary", size: "md" }),
                )}
                to={manga.anilistUrl}
                target="_blank"
              >
                Anilist
              </Link>
              {userSavedManga.data && (
                <Button
                  className="col-span-2"
                  onClick={() => {
                    if (auth.user && id) {
                      removeUserSavedManga.mutate({
                        user: auth.user,
                        mangaId: id,
                      });
                    }
                  }}
                >
                  <StarSolidIcon className="h-6 w-6" />
                  <p>Saved</p>
                </Button>
              )}
              {!userSavedManga.data && (
                <Button
                  className="col-span-2"
                  onClick={() => {
                    if (auth.user && id) {
                      addUserSavedManga.mutate({
                        user: auth.user,
                        mangaId: id,
                      });
                    }
                  }}
                >
                  <StarOutlineIcon className="h-6 w-6" />
                  <p>Save</p>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-2 p-2 md:items-start">
          <span
            className={`whitespace-pre-wrap ${collapsed ? "line-clamp-6" : ""}`}
          >
            {parse(manga.description)}
          </span>
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
            {auth.isLoggedIn && (
              <button
                className="h-6 w-6 rounded border-2 border-black dark:border-white"
                onClick={() => {
                  if (chapterIds.data) {
                    if (selectedItems.length >= chapterIds.data.length) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(chapterIds.data.map((i) => i.id));
                    }
                  }
                }}
              >
                {chapterIds.data &&
                  selectedItems.length >= chapterIds.data.length && (
                    <CheckIcon />
                  )}
              </button>
            )}
          </div>
        </div>

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

            const mark = () => {
              if (!auth.user) {
                return;
              }

              markItems.mutate({ user: auth.user, chapterIds: [item.id] });
            };

            const unmark = () => {
              if (!auth.user || !userMarkedChapters.data) {
                return;
              }

              const id = userMarkedChapters.data?.find(
                (i) => i.chapter === item.id,
              );

              if (id) {
                unmarkItems.mutate({ user: auth.user, ids: [id.id] });
              }
            };

            const setAsCurrent = () => {
              if (!auth.user || !id) {
                return;
              }

              updateBookmark.mutate({
                user: auth.user,
                mangaId: id,
                chapterId: item.id,
                page: 0,
              });
            };

            const showSelectMarker = selectedItems.length > 0;
            const selected = !!selectedItems.find((i) => i === item.id);

            return (
              <ChapterItem
                ref={isViewItem ? ref : undefined}
                key={item.id}
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
                    // markItemCurrent.mutate(selectedItems[0]);
                  }}
                >
                  <BookOpenIcon className="h-7 w-7" />
                </button>
              )}
              <button
                onClick={() => {
                  if (auth.user) {
                    const items = selectedItems.filter((id) => {
                      if (userMarkedChapters.data) {
                        return !userMarkedChapters.data.find(
                          (i) => i.chapter === id,
                        );
                      } else {
                        return false;
                      }
                    });
                    markItems.mutate({
                      user: auth.user,
                      chapterIds: items,
                    });
                  }
                }}
              >
                <BookmarkIcon className="h-7 w-7" />
              </button>
              <button
                onClick={() => {
                  if (auth.user && userMarkedChapters.data) {
                    const items = userMarkedChapters.data
                      .filter((item) => {
                        return selectedItems.find((i) => i === item.chapter);
                      })
                      .map((item) => item.id);
                    unmarkItems.mutate({ user: auth.user, ids: items });
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

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
  PencilSquareIcon,
  StarIcon as StarSolidIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import parse from "html-react-parser";
import { forwardRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useNavigate, useParams } from "react-router-dom";

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
import { BasicChapter } from "../models/chapters";

type ChapterProps = {
  chapter: BasicChapter;
  isContinue: boolean;
  hasRead: boolean;
  isGroup: boolean;

  showSelectMarker: boolean;
  disableSelectMarker: boolean;
  isSelected: boolean;

  select: (select: boolean, shift: boolean) => void;
  mark: () => void;
  unmark: () => void;
  setAsCurrent: () => void;
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

const SmallChapterItem = forwardRef<HTMLDivElement, ChapterProps>(
  (props, ref) => {
    const {
      chapter,
      hasRead,
      isGroup,
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
            {!isGroup && (
              <p className="group-hover:underline">Ch. {chapter.name}</p>
            )}
            {isGroup && (
              <p className="group-hover:underline">
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
  },
);

const SeriesPage = () => {
  const { id } = useParams();

  const mangaQuery = useManga({ mangaId: id });
  const mangaChaptersQuery = useMangaChapterViews({ mangaId: id });

  const [ref, inView] = useInView();
  const auth = useAuth();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const chapterIds = useAllMangaChapterIds({ mangaId: id });

  const userBookmark = useUserBookmark({ userId: auth.user?.id, mangaId: id });
  const userMarkedChapters = useUserMarkedChapters({
    userId: auth.user?.id,
    mangaId: id,
  });

  const userSavedManga = useUserSavedManga({
    userId: auth.user?.id,
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

                    if (auth.user && id) {
                      removeUserSavedManga.mutate({
                        userId: auth.user.id,
                        mangaId: id,
                      });
                    }
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
                    if (auth.user && id) {
                      addUserSavedManga.mutate({
                        userId: auth.user.id,
                        mangaId: id,
                      });
                    }
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

            const mark = () => {
              if (!auth.user) {
                return;
              }

              markItems.mutate({ userId: auth.user.id, chapterIds: [item.id] });
            };

            const unmark = () => {
              if (!auth.user || !userMarkedChapters.data) {
                return;
              }

              const id = userMarkedChapters.data?.find(
                (i) => i.chapter === item.id,
              );

              if (id) {
                unmarkItems.mutate({ userId: auth.user.id, ids: [id.id] });
              }
            };

            const setAsCurrent = () => {
              if (!auth.user || !id) {
                return;
              }

              updateBookmark.mutate({
                userId: auth.user.id,
                mangaId: id,
                chapterId: item.id,
                page: 0,
              });
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
                      userId: auth.user.id,
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
                    unmarkItems.mutate({ userId: auth.user.id, ids: items });
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

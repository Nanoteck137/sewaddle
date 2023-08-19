import { useQuery } from "@tanstack/react-query";
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
  }
>((props, ref) => {
  const { chapter, isContinue, hasRead, isGroup } = props;

  return (
    <Link
      ref={ref}
      to={`/view/${chapter.id}`}
      className="relative flex flex-col items-center rounded border-2 shadow dark:border-gray-500 dark:bg-gray-600"
    >
      {/* <div className="absolute left-4 top-4 flex w-10 items-center justify-center rounded-full border-2 border-black bg-red-400/95 text-black">
        <p className="aspect-square">{chapter.idx}</p>
      </div> */}
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
          alt="Chapter Cover"
        />

        <div
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full p-1 shadow-xl ${
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

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  return (
    <div className="flex flex-col gap-4 p-2">
      <p className="text-center text-2xl">{manga.englishTitle}</p>
      <div className="grid grid-cols-1 place-items-center md:grid-cols-3 md:place-items-start">
        <img
          className="shadow-xl"
          src={pb.getFileUrl(manga, manga.coverExtraLarge)}
          alt=""
        />
        <div className="col-span-2 flex flex-col gap-2 p-2 md:items-start">
          <p
            className={`whitespace-pre-wrap ${collapsed ? "line-clamp-6" : ""}`}
          >
            {parse(manga.description)}
          </p>
          <button onClick={() => setCollapsed((prev) => !prev)}>
            {collapsed ? "Show more" : "Show less"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {lastChapterRead.data && (
          <Link
            className="w-fit rounded bg-red-300 px-4 py-2"
            to={`/view/${lastChapterRead.data.chapter}?page=${lastChapterRead.data.page}`}
          >
            Continue
          </Link>
        )}
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

                  if (isLastPage && isLastItem) {
                    return (
                      <Chapter
                        ref={ref}
                        key={item.id}
                        chapter={item}
                        isContinue={isContinue}
                        hasRead={hasReadChapter}
                        isGroup={manga.isGroup}
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
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;

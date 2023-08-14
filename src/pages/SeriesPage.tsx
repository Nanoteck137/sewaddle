import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";

import { useManga, useMangaChaptersBasic } from "../api/manga";
import { pb } from "../api/pocketbase";
import { BasicChapter } from "../models/chapters";
import { isValidHttpUrl } from "../utils";

const Chapter = (props: { chapter: BasicChapter }) => {
  const { chapter } = props;

  return (
    <Link
      to={`/view/${chapter.id}`}
      className="flex flex-col gap-2 bg-gray-600 rounded p-2 items-center"
    >
      <img
        className="h-44"
        src={pb.getFileUrl(chapter, chapter.cover)}
        alt="Chapter Cover"
      />

      <p className="dark:text-white">
        {chapter.idx} - {chapter.name}
      </p>
    </Link>
  );
};

const SeriesPage = () => {
  const { id } = useParams();
  const mangaQuery = useManga({ id });
  const mangaChaptersQuery = useMangaChaptersBasic({ id });

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  return (
    <div className="flex flex-col gap-10 p-2">
      <div>
        <p className="dark:text-white">Name: {manga.name}</p>
        <p className="dark:text-white whitespace-pre-wrap">
          {manga.description}
        </p>
        <a className="dark:text-white" href={manga.malUrl} target="_blank">
          MAL Link
        </a>
        <p className="dark:text-white">
          Chapters Available: {manga.chaptersAvailable}
        </p>
        <img
          className="w-64"
          src={
            isValidHttpUrl(manga.cover)
              ? manga.cover
              : pb.getFileUrl(manga, manga.cover)
          }
          alt=""
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {chapters.pages.map((page, i) => {
          return (
            <Fragment key={i}>
              {page.items.map((item) => {
                return <Chapter key={item.id} chapter={item} />;
              })}
            </Fragment>
          );
        })}
        <button
          onClick={() => mangaChaptersQuery.fetchNextPage()}
          disabled={
            !mangaChaptersQuery.hasNextPage ||
            mangaChaptersQuery.isFetchingNextPage
          }
        >
          {mangaChaptersQuery.isFetchingNextPage
            ? "Loading more..."
            : mangaChaptersQuery.hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </button>
      </div>
    </div>
  );
};

export default SeriesPage;

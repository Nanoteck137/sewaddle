import { Fragment } from "react";
import { useParams } from "react-router-dom";

import { useManga, useMangaChaptersBasic } from "../api/manga";
import { pb } from "../api/pocketbase";
import { BasicChapter } from "../models/chapters";
import { isValidHttpUrl } from "../utils";

const Chapter = (props: { chapter: BasicChapter }) => {
  const { chapter } = props;
  return (
    <div className="flex gap-2 bg-gray-600 rounded p-2 cursor-pointer">
      <p className="dark:text-white w-12">{chapter.index}</p>
      <p className="dark:text-white">{chapter.name}</p>
      <p className="dark:text-white">{chapter.name}</p>
    </div>
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
      <div className="flex flex-col gap-2">
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
        {/* {chapters.items.map((item) => {
          return (
          );
        })} */}
      </div>
    </div>
  );
};

export default SeriesPage;

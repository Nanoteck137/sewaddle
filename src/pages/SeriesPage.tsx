import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";

import { useManga, useMangaChaptersBasic } from "../api/manga";
import { pb } from "../api/pocketbase";
import { BasicChapter } from "../models/chapters";

const Chapter = (props: { chapter: BasicChapter }) => {
  const { chapter } = props;

  return (
    <Link
      to={`/view/${chapter.id}`}
      className="flex flex-col items-center gap-2 rounded border-2 p-2 shadow dark:border-gray-500 dark:bg-gray-600"
    >
      <img
        className="h-44"
        src={pb.getFileUrl(chapter, chapter.cover)}
        alt="Chapter Cover"
      />

      <p>
        {chapter.idx} - {chapter.name}
      </p>
    </Link>
  );
};

const SeriesPage = () => {
  const { id } = useParams();
  const mangaQuery = useManga({ id });
  const mangaChaptersQuery = useMangaChaptersBasic({ id });

  console.log(mangaQuery.data);

  // const [collapsed, setCollapsed] = useState(true);

  if (mangaQuery.isError || mangaChaptersQuery.isError) return <p>Error</p>;
  if (mangaQuery.isLoading || mangaChaptersQuery.isLoading)
    return <p>Loading...</p>;

  const { data: manga } = mangaQuery;
  const { data: chapters } = mangaChaptersQuery;

  return (
    <div className="flex flex-col gap-10 p-2">
      <p className="text-center text-2xl">{manga.englishTitle}</p>
      <div className="grid grid-cols-1 place-items-center md:grid-cols-3">
        <div className="flex h-full flex-col justify-start">
          <img
            className=""
            src={pb.getFileUrl(manga, manga.coverExtraLarge)}
            alt=""
          />

          <a href={manga.malUrl} target="_blank">
            MyAnimeList
          </a>
        </div>

        {/* <div className="col-span-2 flex h-full flex-col justify-between">
          <div>
            <p
              className={`w-full md:hidden ${
                collapsed
                  ? "line-clamp-1 overflow-hidden"
                  : "whitespace-pre-wrap"
              }`}
            >
              {manga.description}
            </p>
            <button
              className="rounded bg-red-400 px-6 py-2 md:hidden"
              onClick={() => {
                setCollapsed(!collapsed);
              }}
            >
              Toggle
            </button>
            <div className="hidden md:block">
              <p className="whitespace-pre-wrap">{manga.description}</p>
            </div>
          </div> */}
        {/* </div> */}
      </div>

      <div className="flex flex-col gap-2">
        <p>Chapters Available: {manga.chaptersAvailable}</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
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
    </div>
  );
};

export default SeriesPage;

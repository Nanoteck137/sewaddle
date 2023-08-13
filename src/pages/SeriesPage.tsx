import { useParams } from "react-router-dom";

import { useManga, useMangaChaptersBasic } from "../api/manga";
import { pb } from "../api/pocketbase";
import { isValidHttpUrl } from "../utils";

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
    <div>
      <p className="dark:text-white">Name: {manga.name}</p>
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
      <div>
        {chapters.items.map((item) => {
          return (
            <p className="dark:text-white" key={item.id}>
              {item.name}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesPage;

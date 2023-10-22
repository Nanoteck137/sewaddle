import { Link } from "react-router-dom";

import { apiEndpoint } from "@/App";
import { RouterOutput } from "@/trpc";

type MangaList = RouterOutput["manga"]["list"];
type Manga = MangaList[number];

const Item = (props: { manga: Manga }) => {
  const { manga } = props;
  return (
    <Link
      to={`/series/${manga.id}`}
      className={`relative flex h-full max-h-[500px] max-w-xs flex-col items-center overflow-hidden rounded  border-2 bg-white shadow-md dark:border-gray-500 dark:bg-gray-600 md:max-w-sm`}
    >
      <div className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white">
        <p>{manga.chapters}</p>
      </div>
      <img
        className="h-full w-full overflow-clip border-b object-cover dark:border-gray-500"
        src={`${apiEndpoint}${manga.cover}`}
        alt=""
      />
      <p className="p-4 text-center">{manga.title}</p>
    </Link>
  );
};

const MangaList = (props: { list: MangaList }) => {
  const { list } = props;

  return (
    <>
      <div className="grid grid-cols-1 place-items-center gap-4 p-2 md:grid-cols-2 lg:grid-cols-4">
        {list.map((item) => {
          return <Item key={item.id} manga={item} />;
        })}
      </div>
    </>
  );
};

export default MangaList;

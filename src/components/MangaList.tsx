import { Link } from "react-router-dom";

import { pb } from "../api/pocketbase";
import { MangaView } from "../models/manga";

const Item = (props: { manga: MangaView }) => {
  const { manga } = props;
  return (
    <Link
      to={`/series/${manga.id}`}
      className={`relative flex h-full max-h-[500px] max-w-xs flex-col items-center overflow-hidden rounded  border-2 bg-white shadow-md dark:border-gray-500 dark:bg-gray-600 md:max-w-sm`}
    >
      <div className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white">
        <p>{manga.chaptersAvailable}</p>
      </div>
      <img
        className="h-full w-full overflow-clip object-cover"
        src={pb.getFileUrl(manga, manga.coverExtraLarge)}
        alt=""
      />
      <p className="p-4 text-center">{manga.englishTitle}</p>
    </Link>
  );
};

const MangaList = (props: { list: MangaView[] }) => {
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

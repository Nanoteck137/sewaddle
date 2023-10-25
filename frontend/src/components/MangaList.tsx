import { apiEndpoint } from "@/App";
import { RouterOutput } from "@/trpc";
import { Link } from "react-router-dom";

type MangaList = RouterOutput["manga"]["list"];
type Manga = MangaList[number];

const Item = (props: { manga: Manga }) => {
  const { manga } = props;
  return (
    <Link
      className="relative flex h-[560px] w-full max-w-[390px] flex-col overflow-clip rounded border-2 bg-white shadow-md transition-transform hover:shadow-xl active:scale-95 dark:border-gray-500 dark:bg-gray-600 md:h-[450px]"
      to={`/series/${manga.id}`}
    >
      <div className="absolute right-2 top-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white">
        <p>{manga.chapters}</p>
      </div>
      <div className="relative h-full w-full">
        <img
          className="pointer-events-none absolute flex h-full w-full border-b-2 object-cover dark:border-gray-500"
          src="https://placehold.co/380x500.png?text=Loading..."
          alt=""
        />
        <img
          className="pointer-events-none absolute flex h-full w-full border-b-2 object-cover dark:border-gray-500"
          src={`${apiEndpoint}${manga.cover}`}
          alt=""
        />
      </div>

      <p className="w-full p-4 text-center">{manga.title}</p>
    </Link>
    // <Link
    //   to={`/series/${manga.id}`}
    //   className={`relative flex h-full max-h-[500px] max-w-xs flex-col items-center overflow-hidden rounded border-2 bg-white shadow-md dark:border-gray-500 dark:bg-gray-600 md:max-w-sm`}
    // >
    //   <div className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white">
    //     <p>{manga.chapters}</p>
    //   </div>
    //   <div className="bg-red-500">
    //     {/* <img
    //       className="h-full w-full overflow-clip border-b object-cover dark:border-gray-500"
    //       src={`${apiEndpoint}${manga.cover}`}
    //       alt="Manga Cover"
    //     /> */}
    //   </div>
    //   <p className="w-full p-4 text-center">{manga.title}</p>
    // </Link>
  );
};

const MangaList = (props: { list: MangaList }) => {
  const { list } = props;

  return (
    <>
      <div className="grid grid-cols-1 place-items-center gap-4 p-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map((item) => {
          return <Item key={item.id} manga={item} />;
        })}
      </div>
    </>
  );
};

export default MangaList;

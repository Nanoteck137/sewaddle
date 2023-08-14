import { Link } from "react-router-dom";

import { useMangas } from "../api/manga";
import { pb } from "../api/pocketbase";
import { MangaView } from "../models/manga";
import { isValidHttpUrl } from "../utils";

// const items = new Array(100).fill(0).map(() => genRandomManga());
// const demo = {
//   items: items,
//   page: 0,
//   perPage: 0,
//   totalItems: 0,
//   totalPages: 0,
// };

// function genRandomManga(): Manga {
//   const mangaTitles = [
//     "Konosuba: God's Blessing On This Wonderful World!",
//     "Konosuba: An Explosion On This Wonderful World!",
//     "That Time I Got Reincarnated As A Slime",
//     "More Than A Married Couple, But Not Lovers",
//     "The Ice Guy And His Cool Female Colleague",
//     "I've Been Killing Slimes For 300 Years And Maxed Out My Level",
//     "Hell's Paradise: Jigokuraku",
//     "JoJo no Kimyou na Bouken Part 7: Steel Ball Run",
//     "The Quintessential Quintuplets",
//     "One Piece",
//     "Berserk",
//     "Chainsaw Man",
//     "My Hero Academia",
//     "One-Punch Man",
//     "Tokyo Ghoul",
//     "I Belong To The Baddest Girl At School",
//     "Jujutsu Kaisen",
//     "Karma of Purgatory",
//     "Kubo Won't Let Me Be Invisible",
//   ];

//   const i = Math.floor(Math.random() * mangaTitles.length);
//   const name = mangaTitles[i];

//   const min = 650;
//   const max = 800;
//   const height = Math.floor(Math.random() * (max - min)) + min;
//   // console.log("Height", height);

//   return {
//     id: Math.floor(Math.random() * 1000000).toString(),
//     name,
//     cover: `https://placehold.co/460x${800}`,
//     malUrl: "",

//     totalChapters: Math.floor(Math.random() * 2000),

//     created: new Date(),
//     updated: new Date(),

//     collectionId: "",
//     collectionName: "",
//   };
// }

const Item = (props: { manga: MangaView }) => {
  const { manga } = props;
  return (
    <div
      key={manga.id}
      className="flex cursor-pointer overflow-hidden rounded border-2 border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-600"
      onClick={() => {
        console.log("Click");
      }}
    >
      <img
        className="w-[80px] min-w-[80px] overflow-clip"
        src={
          isValidHttpUrl(manga.cover)
            ? manga.cover
            : pb.getFileUrl(manga, manga.cover)
        }
        alt=""
      />
      <div className="flex flex-col justify-between gap-2 p-2">
        <p className="line-clamp-2 font-bold">{manga.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-200">
          Chapters: {manga.chaptersAvailable}
        </p>
      </div>
    </div>
  );
};

const ItemTest = (props: { manga: MangaView }) => {
  const { manga } = props;
  return (
    <Link
      to={`/series/${manga.id}`}
      className="relative flex h-full max-w-xs flex-col items-center overflow-hidden rounded  border-2 bg-white shadow-md dark:border-gray-500 dark:bg-gray-600 md:max-w-sm"
    >
      <div className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 text-white">
        <p>{manga.chaptersAvailable}</p>
      </div>
      <img
        className="h-auto max-w-full overflow-clip object-cover md:h-full"
        src={
          isValidHttpUrl(manga.cover)
            ? manga.cover
            : pb.getFileUrl(manga, manga.cover)
        }
        alt=""
      />
      <p className="p-4 text-center">{manga.name}</p>
    </Link>
  );
};

const MangaList = (props: { list: MangaView[] }) => {
  const { list } = props;
  // console.log(data);
  return (
    <>
      <div className="grid grid-cols-1 place-items-center gap-4 p-2 md:grid-cols-2 lg:grid-cols-4">
        {list.map((item) => {
          return <ItemTest key={item.id} manga={item} />;
        })}
      </div>
    </>
  );
};

const HomePage = () => {
  const { data, isLoading, isError } = useMangas();

  if (isError) return <p>Error</p>;
  if (isLoading) return <p>Loading...</p>;

  return <MangaList list={data.items} />;
};

export default HomePage;

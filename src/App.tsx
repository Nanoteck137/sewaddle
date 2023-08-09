import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import PocketBase from "pocketbase";
import { useTernaryDarkMode } from "usehooks-ts";
import { z } from "zod";

const queryClient = new QueryClient();
const pb = new PocketBase("http://10.28.28.5:8090");

const Manga = z.object({
  id: z.string(),
  name: z.string(),
  cover: z.string(),
  malUrl: z.string(),

  totalChapters: z.number(),

  created: z.coerce.date(),
  updated: z.coerce.date(),

  collectionId: z.string(),
  collectionName: z.string(),
});
type Manga = z.infer<typeof Manga>;

const MangaList = z.object({
  items: z.array(Manga),
  page: z.number(),
  perPage: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

async function getMangas() {
  // const res = await pb.collection("manga_list").getList();
  // return await MangaList.parseAsync(res);

  const items = new Array(100).fill(0).map(() => genRandomManga());
  return {
    items: items,
    page: 0,
    perPage: 0,
    totalItems: 0,
    totalPages: 0,
  };
}

function genRandomManga(): Manga {
  const mangaTitles = [
    "Konosuba: God's Blessing On This Wonderful World!",
    "Konosuba: An Explosion On This Wonderful World!",
    "That Time I Got Reincarnated As A Slime",
    "More Than A Married Couple, But Not Lovers",
    "The Ice Guy And His Cool Female Colleague",
    "I've Been Killing Slimes For 300 Years And Maxed Out My Level",
    "Hell's Paradise: Jigokuraku",
    "JoJo no Kimyou na Bouken Part 7: Steel Ball Run",
    "The Quintessential Quintuplets",
    "One Piece",
    "Berserk",
    "Chainsaw Man",
    "My Hero Academia",
    "One-Punch Man",
    "Tokyo Ghoul",
    "I Belong To The Baddest Girl At School",
    "Jujutsu Kaisen",
    "Karma of Purgatory",
    "Kubo Won't Let Me Be Invisible",
  ];

  const i = Math.floor(Math.random() * mangaTitles.length);
  const name = mangaTitles[i];

  const min = 650;
  const max = 800;
  const height = Math.floor(Math.random() * (max - min)) + min;
  // console.log("Height", height);

  return {
    id: (Math.random() * 1000000).toString(),
    name,
    cover: `https://placehold.co/460x${800}`,
    malUrl: "",

    totalChapters: Math.floor(Math.random() * 2000),

    created: new Date(),
    updated: new Date(),

    collectionId: "",
    collectionName: "",
  };
}

function isValidHttpUrl(s: string) {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

const Mangas = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mangas"],
    queryFn: getMangas,
    initialData: () => {},
  });

  if (isError) return <p>Error</p>;
  if (isLoading) return <p>Loading...</p>;

  // console.log(data);
  return (
    <>
      <p className="text-black dark:text-white">Mangas</p>
      <div className="flex flex-col gap-4 p-2">
        {data.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex cursor-pointer overflow-hidden rounded border-2 border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-600"
              onClick={() => {
                console.log("Click");
              }}
            >
              <img
                className="w-[80px] overflow-clip"
                src={
                  isValidHttpUrl(item.cover)
                    ? item.cover
                    : pb.getFileUrl(item, item.cover)
                }
                alt=""
              />
              <div className="flex flex-col justify-between gap-2 p-2">
                <p className="line-clamp-2 font-bold text-black dark:text-white">
                  {item.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-200">
                  Chapters: {item.totalChapters}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const Home = () => {
  const { isDarkMode, setTernaryDarkMode, ternaryDarkMode } =
    useTernaryDarkMode();

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="h-screen w-full bg-white dark:bg-slate-800">
        <div className="flex gap-4">
          <button
            className="rounded bg-red-200 px-2 py-0"
            onClick={() => {
              setTernaryDarkMode("dark");
            }}
          >
            Dark
          </button>
          <button
            className="rounded bg-red-200 px-2 py-0"
            onClick={() => {
              setTernaryDarkMode("light");
            }}
          >
            Light
          </button>
          <button
            className="rounded bg-red-200 px-2 py-0"
            onClick={() => {
              setTernaryDarkMode("system");
            }}
          >
            System
          </button>
        </div>
        <p className="text-black dark:text-white">{ternaryDarkMode}</p>
        <Mangas />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </>
  );
};

export default App;

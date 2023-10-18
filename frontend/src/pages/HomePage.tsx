import MangaList from "@/components/MangaList";
import { trpc } from "@/trpc";

const HomePage = () => {
  const { data, isLoading, error } = trpc.manga.list.useQuery();

  // const { data, isLoading, isError } = useMangaViews();
  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return <MangaList list={data} />;
};

export default HomePage;

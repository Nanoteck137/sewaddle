import { useMangaViews } from "../api";
import MangaList from "../components/MangaList";

const HomePage = () => {
  const { data, isLoading, isError } = useMangaViews();

  if (isError) return <p>Error</p>;
  if (isLoading) return <p>Loading...</p>;

  return <MangaList list={data} />;
};

export default HomePage;

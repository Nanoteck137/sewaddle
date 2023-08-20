import { useMangas } from "../api/manga";
import MangaList from "../components/MangaList";

const HomePage = () => {
  const { data, isLoading, isError } = useMangas();

  if (isError) return <p>Error</p>;
  if (isLoading) return <p>Loading...</p>;

  return <MangaList list={data.items} />;
};

export default HomePage;

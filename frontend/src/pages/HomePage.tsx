import { trpc } from "@/trpc";

const HomePage = () => {
  const { data, isLoading, error } = trpc.manga.list.useQuery();

  // const { data, isLoading, isError } = useMangaViews();
  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {data.map((item) => {
        return <p key={item.id}>{item.title}</p>;
      })}
    </div>
  );
  // return <MangaList list={data} />;
};

export default HomePage;

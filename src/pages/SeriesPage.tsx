import { useParams } from "react-router-dom";

const SeriesPage = () => {
  const { id } = useParams();
  return <p className="dark:text-white">Series Page: {id}</p>;
};

export default SeriesPage;

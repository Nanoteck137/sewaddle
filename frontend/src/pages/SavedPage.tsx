import { Navigate } from "react-router-dom";

import MangaList from "@/components/MangaList";
import { trpc } from "@/trpc";
import { useAuth } from "../contexts/AuthContext";

const SavedPage = () => {
  const auth = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/" />;

  const savedMangas = trpc.manga.userSavedList.useQuery();

  if (savedMangas.error) return <p>{savedMangas.error.message}</p>;
  if (savedMangas.isLoading) return <p>Loading...</p>;

  return <MangaList list={savedMangas.data} />;
};

export default SavedPage;

import { Navigate } from "react-router-dom";

import { useUserSavedMangas } from "../api";
import MangaList from "../components/MangaList";
import { useAuth } from "../contexts/AuthContext";

const SavedPage = () => {
  const auth = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/" />;

  const userSavedMangas = useUserSavedMangas({ userId: auth.user?.id });

  if (userSavedMangas.isError) return <p>Error</p>;
  if (userSavedMangas.isLoading) return <p>Loading...</p>;

  const mangaList = userSavedMangas.data.items.map((i) => i.expand.manga);

  return (
    <div>
      <MangaList list={mangaList} />
    </div>
  );
};

export default SavedPage;

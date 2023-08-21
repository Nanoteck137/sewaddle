import { useUserSavedMangas } from "../api";
import MangaList from "../components/MangaList";
import { useAuth } from "../contexts/AuthContext";

const SavedPage = () => {
  const auth = useAuth();

  const userSavedMangas = useUserSavedMangas({ userId: auth.user?.id });

  if (userSavedMangas.isError) return <p>Error</p>;
  if (userSavedMangas.isLoading) return <p>Loading...</p>;

  // if (!auth.isLoggedIn) return <Navigate to="/" />;

  const mangaList = userSavedMangas.data.items.map((i) => i.expand.manga);

  return (
    <div>
      <MangaList list={mangaList} />
    </div>
  );
};

export default SavedPage;

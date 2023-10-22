import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const SavedPage = () => {
  const auth = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/" />;

  return (
    <p className="font-bold text-xl grid place-items-center">
      Not implemented yet
    </p>
  );

  // const userSavedMangas = useUserSavedMangas({ user: auth.user });

  // if (userSavedMangas.isError) return <p>Error</p>;
  // if (userSavedMangas.isLoading) return <p>Loading...</p>;

  // const mangaList = userSavedMangas.data.items.map((i) => i.expand.manga);

  // return (
  //   <div>
  //     <MangaList list={mangaList} />
  //   </div>
  // );
};

export default SavedPage;

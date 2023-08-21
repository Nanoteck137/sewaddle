import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import { useUserSavedMangas } from "../api";
import { pb } from "../api/pocketbase";
import MangaList from "../components/MangaList";
import { useAuth } from "../contexts/AuthContext";
import { Collection } from "../models/collection";
import { MangaView } from "../models/manga";

const Schema = z.array(
  Collection.extend({
    user: z.string(),
    manga: z.string(),
    expand: z.object({
      manga: MangaView,
    }),
  }),
);

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

import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { z } from "zod";

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
  const savedMangas = useQuery({
    queryKey: ["savedManga", auth.user?.id],
    queryFn: async () => {
      const list = await pb
        .collection("userMangaSaved")
        .getFullList({ expand: "manga" });
      return await Schema.parseAsync(list);
    },
    select: (data) => data.map((i) => i.expand.manga),
    enabled: !!auth.user,
  });

  console.log(savedMangas.data);

  if (savedMangas.isError) return <p>Error</p>;
  if (savedMangas.isLoading) return <p>Loading...</p>;

  // if (!auth.isLoggedIn) return <Navigate to="/" />;

  return (
    <div>
      <MangaList list={savedMangas.data} />
    </div>
  );
};

export default SavedPage;

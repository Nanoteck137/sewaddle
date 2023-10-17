import { db } from "../../db";
import { publicProcedure, router } from "../../trpc";

export const mangaRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const res = await db.query.mangas.findMany({
      columns: { id: true, title: true, cover: true },
      with: {
        chapters: {
          columns: { index: true },
        },
      },
    });
    return res.map((manga) => ({
      ...manga,
      chapters: manga.chapters.length,
      cover: `/image/manga/${manga.id}/${manga.cover}`,
    }));
  }),
});

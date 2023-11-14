import { eq, sql } from "drizzle-orm";
import { Router } from "express";
import { db } from "../../../db";
import { chapters, mangas } from "../../../schema";

export default Router().get("/list", async (_req, res) => {
  const chapterCount = db
    .select({
      mangaId: chapters.mangaId,
      count: sql<number>`COUNT(${chapters.index})`.as("count"),
    })
    .from(chapters)
    .groupBy(chapters.mangaId)
    .as("chapterCount");

  const result = await db
    .select({
      id: mangas.id,
      title: mangas.title,
      cover: mangas.cover,
      chapters: chapterCount.count,
    })
    .from(mangas)
    .where(eq(mangas.available, true))
    .leftJoin(chapterCount, eq(chapterCount.mangaId, mangas.id))
    .orderBy(mangas.title);

  res.json(
    result.map((manga) => ({
      ...manga,
      cover: `/image/manga/${manga.id}/${manga.cover}`,
    })),
  );
});

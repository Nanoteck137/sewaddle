import { z } from "zod";
import { db } from "../../db";
import { publicProcedure, router } from "../../trpc";
import { chapters, mangas } from "../../schema";
import { and, desc, eq, gt, lt, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const mangaRouter = router({
  list: publicProcedure.query(async ({}) => {
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
  get: publicProcedure
    .input(z.object({ mangaId: z.string().cuid2() }))
    .query(async ({ input }) => {
      const manga = await db.query.mangas.findFirst({
        where: eq(mangas.id, input.mangaId),
        with: {
          chapters: {
            columns: {
              index: true,
            },
          },
        },
      });

      if (!manga) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Manga not found" });
      }

      return {
        ...manga,
        cover: `/image/manga/${manga.id}/${manga.cover}`,
      };
    }),
  getChapters: publicProcedure
    .input(z.object({ mangaId: z.string().cuid2() }))
    .query(async ({ input }) => {
      const result = await db.query.chapters.findMany({
        columns: {
          index: true,
          name: true,
          cover: true,
          mangaId: true,
        },
        where: eq(chapters.mangaId, input.mangaId),
      });

      return result.map((chapter) => ({
        ...chapter,
        cover: `/image/chapter/${input.mangaId}/${chapter.index}/${chapter.cover}`,
      }));
    }),
  viewChapter: publicProcedure
    .input(z.object({ mangaId: z.string().cuid2(), chapterIndex: z.number() }))
    .query(async ({ input }) => {
      const result = await db.query.chapters.findFirst({
        where: and(
          eq(chapters.mangaId, input.mangaId),
          eq(chapters.index, input.chapterIndex),
        ),
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chapter not found",
        });
      }

      const next = db
        .select({ index: chapters.index })
        .from(chapters)
        .where(
          and(
            eq(chapters.mangaId, input.mangaId),
            gt(chapters.index, result.index),
          ),
        )
        .limit(1);
      const prev = db
        .select({ index: chapters.index })
        .from(chapters)
        .where(
          and(
            eq(chapters.mangaId, input.mangaId),
            lt(chapters.index, result.index),
          ),
        )
        .orderBy(desc(chapters.index))
        .limit(1);

      const res = await Promise.all([next, prev]);
      console.log("Res", res);

      console.log(res[1]);
      const nextIndex = res[0].at(0);
      const prevIndex = res[1].at(0);
      console.log("Next", nextIndex);
      console.log("Prev", prevIndex);

      return {
        ...result,
        pages: result.pages.map(
          (page) => `/image/chapter/${result.mangaId}/${result.index}/${page}`,
        ),
        cover: `/image/chapter/${result.mangaId}/${result.index}/${result.cover}`,
        nextChapter: nextIndex?.index ?? null,
        prevChapter: prevIndex?.index ?? null,
      };
    }),
});

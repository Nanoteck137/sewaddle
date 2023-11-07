import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import {
  chapters,
  mangas,
  userBookmarks,
  userChapterMarked,
  userSavedMangas,
} from "../../schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";

export const mangaRouter = router({
  list: publicProcedure.query(async ({}) => {
    const chapterCount = db
      .select({
        mangaId: chapters.mangaId,
        count: sql<number>`COUNT(${chapters.index})`.as("count"),
      })
      .from(chapters)
      .groupBy(chapters.mangaId)
      .as("chapterCount");

    const res = await db
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

    return res.map((manga) => ({
      ...manga,
      cover: `/image/manga/${manga.id}/${manga.cover}`,
    }));
  }),
  userSavedList: protectedProcedure.query(async ({ ctx }) => {
    const mangaMap = db
      .select()
      .from(userSavedMangas)
      .where(eq(userSavedMangas.userId, ctx.user.id))
      .as("mangaMap");

    const chapterCount = db
      .select({
        mangaId: chapters.mangaId,
        count: sql<number>`COUNT(${chapters.index})`.as("count"),
      })
      .from(chapters)
      .groupBy(chapters.mangaId)
      .as("chapterCount");

    const res = await db
      .select({
        id: mangas.id,
        title: mangas.title,
        cover: mangas.cover,
        chapters: chapterCount.count,
      })
      .from(mangas)
      .innerJoin(mangaMap, eq(mangaMap.mangaId, mangas.id))
      .leftJoin(chapterCount, eq(chapterCount.mangaId, mangas.id))
      .orderBy(mangas.title);

    return res.map((manga) => ({
      ...manga,
      cover: `/image/manga/${manga.id}/${manga.cover}`,
    }));
  }),
  userSaveManga: protectedProcedure
    .input(
      z.object({
        mangaId: z.string().cuid2(),
        unsave: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.unsave) {
        await db
          .insert(userSavedMangas)
          .values({
            userId: ctx.user.id,
            mangaId: input.mangaId,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(userSavedMangas)
          .where(
            and(
              eq(userSavedMangas.userId, ctx.user.id),
              eq(userSavedMangas.mangaId, input.mangaId),
            ),
          );
      }
    }),
  get: publicProcedure
    .input(z.object({ mangaId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const user = ctx.userId
        ? {
            saved: !!(await db.query.userSavedMangas.findFirst({
              where: and(
                eq(userSavedMangas.userId, ctx.userId ?? ""),
                eq(userSavedMangas.mangaId, input.mangaId),
              ),
            })),
          }
        : undefined;

      const manga = await db.query.mangas.findFirst({
        where: eq(mangas.id, input.mangaId),
        with: {
          chapters: {
            columns: {
              index: true,
            },
            where: eq(chapters.available, true),
          },
        },
      });

      if (!manga) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Manga not found" });
      }

      console.log(manga);

      return {
        ...manga,
        cover: `/image/manga/${manga.id}/${manga.cover}`,
        user,
      };
    }),
  getChapters: publicProcedure
    .input(z.object({ mangaId: z.string().cuid2() }))
    .query(async ({ input, ctx }) => {
      const userReadQuery = db
        .select({ index: userChapterMarked.index })
        .from(userChapterMarked)
        .where(
          and(
            eq(userChapterMarked.mangaId, input.mangaId),
            eq(userChapterMarked.userId, ctx.userId ?? ""),
          ),
        )
        .as("userReadQuery");
      const userBookmarkQuery = db
        .select()
        .from(userBookmarks)
        .where(
          and(
            eq(userBookmarks.mangaId, input.mangaId),
            eq(userBookmarks.userId, ctx.userId ?? ""),
          ),
        )
        .as("userBookmark");
      const result = await db
        .select({
          index: chapters.index,
          name: chapters.name,
          cover: chapters.cover,
          mangaId: chapters.mangaId,
          user: {
            read: userReadQuery.index,
            bookmark: userBookmarkQuery.page,
          },
        })
        .from(chapters)
        .where(
          and(
            eq(chapters.mangaId, input.mangaId),
            eq(chapters.available, true),
          ),
        )
        .leftJoin(userReadQuery, eq(userReadQuery.index, chapters.index))
        .leftJoin(
          userBookmarkQuery,
          eq(userBookmarkQuery.chapterIndex, chapters.index),
        )
        .orderBy(asc(chapters.index));

      return result.map((obj) => ({
        ...obj,
        cover: `/image/chapter/${input.mangaId}/${obj.index}/${obj.cover}`,
        user: ctx.userId ? { ...obj.user, read: !!obj.user.read } : undefined,
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
  updateUserBookmark: protectedProcedure
    .input(
      z.object({
        mangaId: z.string().cuid2(),
        chapterIndex: z.number(),
        page: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .insert(userBookmarks)
        .values({
          userId: ctx.user.id,
          mangaId: input.mangaId,
          chapterIndex: input.chapterIndex,
          page: input.page,
        })
        .onConflictDoUpdate({
          target: [userBookmarks.userId, userBookmarks.mangaId],
          set: {
            chapterIndex: input.chapterIndex,
            page: input.page,
          },
        });
    }),
  markChapters: protectedProcedure
    .input(
      z.object({ mangaId: z.string().cuid2(), chapters: z.array(z.number()) }),
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .insert(userChapterMarked)
        .values(
          input.chapters.map((index) => ({
            userId: ctx.user.id,
            mangaId: input.mangaId,
            index,
          })),
        )
        .onConflictDoNothing();
    }),
  unmarkChapters: protectedProcedure
    .input(
      z.object({ mangaId: z.string().cuid2(), chapters: z.array(z.number()) }),
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        for (let chapter of input.chapters) {
          await tx
            .delete(userChapterMarked)
            .where(
              and(
                eq(userChapterMarked.userId, ctx.user.id),
                eq(userChapterMarked.mangaId, input.mangaId),
                eq(userChapterMarked.index, chapter),
              ),
            );
        }
      });
    }),
});

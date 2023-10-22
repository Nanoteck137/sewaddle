import { publicProcedure, router } from "../trpc";
import { mangaRouter } from "./manga/router";
import { authRouter } from "./auth/router";
import { z } from "zod";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  auth: authRouter,
  manga: mangaRouter,

  needSetup: publicProcedure.query(async () => {
    const res = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.isAdmin, true),
    });

    return !res;
  }),

  setup: publicProcedure
    .input(
      z.object({ username: z.string().min(1), password: z.string().min(8) }),
    )
    .mutation(async ({ input }) => {
      await db.insert(users).values({
        ...input,
      });
    }),
});

export type AppRouter = typeof appRouter;

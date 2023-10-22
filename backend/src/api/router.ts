import { publicProcedure, router } from "../trpc";
import { mangaRouter } from "./manga/router";
import { authRouter } from "./auth/router";
import { z } from "zod";
import { db } from "../db";
import { users } from "../schema";
import { createConfig } from "../config";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  auth: authRouter,
  manga: mangaRouter,

  needSetup: publicProcedure.query(async ({ ctx }) => {
    return !ctx.config;
  }),

  setup: publicProcedure
    .input(
      z.object({ username: z.string().min(1), password: z.string().min(8) }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.config) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Server is already setup",
        });
      }

      const [user] = await db
        .insert(users)
        .values({
          ...input,
        })
        .returning({ id: users.id });

      createConfig(user.id);
    }),
});

export type AppRouter = typeof appRouter;

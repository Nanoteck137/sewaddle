import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { createConfig } from "../../config";
import { db } from "../../db";
import { users } from "../../schema";

export const setupRouter = router({
  needed: publicProcedure.query(async ({ ctx }) => {
    return !ctx.config;
  }),

  run: publicProcedure
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

import { TRPCError } from "@trpc/server";
import bcrypy from "bcrypt";
import { z } from "zod";
import { createConfig } from "../../config";
import { db } from "../../db";
import { users } from "../../schema";
import { publicProcedure, router } from "../../trpc";

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

      // TODO(patrik): saltRound should be a constant
      const password = await bcrypy.hash(input.password, 10);

      const [user] = await db
        .insert(users)
        .values({
          username: input.username,
          password,
        })
        .returning({ id: users.id });

      createConfig(user.id);
    }),
});

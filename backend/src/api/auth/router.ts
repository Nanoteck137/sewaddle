import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { db } from "../../db";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { env } from "../../env";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user || user.password !== input.password) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET);
      return {
        token,
      };
    }),
  register: publicProcedure.mutation(() => {}),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
      password: undefined,
    };
  }),
});

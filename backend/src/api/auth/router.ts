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
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(8),
        passwordConfirm: z.string().min(8),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.password !== input.passwordConfirm) {
        // TODO(patrik): Add message
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await db.insert(users).values({
        username: input.username,
        password: input.password,
      });
    }),
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(1),
        newPasswordConfirm: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.newPassword !== input.newPasswordConfirm) {
        // TODO(patrik): Add message
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (ctx.user.password !== input.oldPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old password mismatch",
        });
      }

      await db
        .update(users)
        .set({ password: input.newPassword })
        .where(eq(users.id, ctx.user.id));
    }),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
      password: undefined,
    };
  }),
});

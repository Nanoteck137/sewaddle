import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../db";
import { env } from "../../env";
import { users } from "../../schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      console.log(user);

      const passwordResult = await bcrypt.compare(
        input.password,
        user.password,
      );

      if (!passwordResult) {
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

      const result = await bcrypt.hash(input.password, 10);

      await db.insert(users).values({
        username: input.username,
        password: result,
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

      const oldPasswordMatch = await bcrypt.compare(
        input.oldPassword,
        ctx.user.password,
      );

      if (!oldPasswordMatch) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old password mismatch",
        });
      }

      const newPassword = await bcrypt.hash(input.newPassword, 10);

      await db
        .update(users)
        .set({ password: newPassword })
        .where(eq(users.id, ctx.user.id));
    }),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
      password: undefined,
    };
  }),
});

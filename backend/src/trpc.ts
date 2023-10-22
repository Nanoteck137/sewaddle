import { TRPCError, initTRPC } from "@trpc/server";
import { OpenApiMeta } from "trpc-openapi";
import { db } from "./db";
import { ServerConfig, users } from "./schema";
import { eq } from "drizzle-orm";

export type Context = {
  config: ServerConfig | null;
  userId: string | null;
};

export const t = initTRPC.meta<OpenApiMeta>().context<Context>().create();

const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, ctx.userId),
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { mangaRouter } from "./manga/router";

export const appRouter = router({
  manga: mangaRouter,
  test: publicProcedure
    .meta({ openapi: { method: "GET", path: "/test" } })
    .input(z.void())
    .output(z.object({ message: z.string() }))
    .query(() => {
      return {
        message: "Hello World",
      };
    }),
});

export type AppRouter = typeof appRouter;

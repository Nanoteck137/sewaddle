import { router } from "../trpc";
import { mangaRouter } from "./manga/router";
import { authRouter } from "./auth/router";

export const appRouter = router({
  auth: authRouter,
  manga: mangaRouter,
});

export type AppRouter = typeof appRouter;

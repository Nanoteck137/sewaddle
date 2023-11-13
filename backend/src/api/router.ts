import { router } from "../trpc";
import { authRouter } from "./auth/router";
import { mangaRouter } from "./manga/router";
import { setupRouter } from "./setup/router";

export const appRouter = router({
  auth: authRouter,
  manga: mangaRouter,
  setup: setupRouter,
});

export type AppRouter = typeof appRouter;

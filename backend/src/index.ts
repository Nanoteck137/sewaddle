import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import { appRouter } from "./api/router";
import { env } from "./env";
import { Context } from "./trpc";
import { db } from "./db";
import { mangas } from "./schema";
import { eq } from "drizzle-orm";
import { ZodError, z } from "zod";

function createContextInner(): Context {
  return {};
}

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext: () => createContextInner(),
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => createContextInner(),
  }),
);

const FetchMangaImageSchema = z.object({
  mangaId: z.string().cuid2(),
  image: z.string(),
});

app.get("/image/manga/:mangaId/:image", async (req, res) => {
  try {
    const params = await FetchMangaImageSchema.parseAsync(req.params);

    const p = path.join(env.TARGET_PATH, params.mangaId);
    res.sendFile(params.image, { root: p, maxAge: 86400 * 30 * 1000 }, (e) => {
      if (e) {
        res.status(404).json({ message: "Cover not available" });
      }
    });
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json({ message: e.errors[0].message });
      return;
    }
  }
});

const FetchChapterImageSchema = z.object({
  mangaId: z.string().cuid2(),
  chapterIndex: z.coerce.number(),
  image: z.string(),
});

app.get("/image/chapter/:mangaId/:chapterIndex/:image", async (req, res) => {
  try {
    const params = await FetchChapterImageSchema.parseAsync(req.params);

    const p = path.join(
      env.TARGET_PATH,
      params.mangaId,
      "chapters",
      params.chapterIndex.toString(),
    );
    res.sendFile(params.image, { root: p }, (e) => {
      if (e) {
        console.log(e);
        res.status(404).json({ message: "Cover not available" });
      }
    });
  } catch (e) {
    if (e instanceof ZodError) {
      res.status(400).json({ message: e.errors[0].message });
      return;
    }
  }
});

if (env.NODE_ENV !== "development") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public/index.html"));
  });
}

app.listen(3000);

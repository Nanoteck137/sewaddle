import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { existsSync } from "fs";
import fs from "fs/promises";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import path from "path";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import { ZodError, z } from "zod";
import { appRouter } from "./api/router";
import { db } from "./db";
import { env } from "./env";
import { chapters, mangas } from "./schema";
import { Context } from "./trpc";
import { MangaMetadata } from "./model/manga";
import { eq } from "drizzle-orm";
import {
  readMangaMetadataFromDir,
  readMangaMetadataWithId,
} from "./util/manga";

const TokenSchema = z.object({ userId: z.string().cuid2() });

function createContextInner(token: string | null): Context {
  if (token) {
    const j = jwt.verify(token, env.JWT_SECRET);
    const o = TokenSchema.safeParse(j);
    if (o.success) {
      return {
        userId: o.data.userId,
      };
    }
  }

  return {
    userId: null,
  };
}

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext: () => createContextInner(null),
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => {
      const auth = req.headers.authorization;
      const token = auth?.split(" ").at(1);

      return createContextInner(token ?? null);
    },
  }),
);

const FetchMangaImageSchema = z.object({
  mangaId: z.string().cuid2(),
  image: z.string(),
});

app.get("/image/manga/:mangaId/:image", async (req, res) => {
  try {
    const params = await FetchMangaImageSchema.parseAsync(req.params);

    const p = path.join(env.TARGET_PATH, params.mangaId, "images");
    console.log(p);

    if (!existsSync(path.join(p, params.image))) {
      res.status(404);
      return;
    }

    res.sendFile(params.image, { root: p, maxAge: 86400 * 30 * 1000 }, (e) => {
      // if (e) {
      //   res.status(404).json({ message: "Cover not available" });
      // }
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
        res.status(404).json({ message: "Image not available" });
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

app.listen(3000, () => console.log("Server started on port '3000'"));

const CHAPTERS_DIR = "chapters";
const IMAGES_DIR = "images";
const MANGA_FILENAME = "manga.json";

function isValidEntry(p: string) {
  const chapterDirExists = existsSync(path.join(p, CHAPTERS_DIR));
  const imageDirExists = existsSync(path.join(p, IMAGES_DIR));
  const mangaFileExists = existsSync(path.join(p, MANGA_FILENAME));

  return chapterDirExists && imageDirExists && mangaFileExists;
}

async function sync() {
  const entries = (await fs.readdir(env.TARGET_PATH)).filter(
    (e) => e !== "cache",
  );

  const mangaList = await db.query.mangas.findMany({
    with: {
      chapters: true,
    },
  });

  const mangaCollection = entries
    .map((e) => path.join(env.TARGET_PATH, e))
    .filter((dir) => {
      return isValidEntry(dir);
    })
    .map((dir) => {
      return readMangaMetadataFromDir(dir);
    });

  const missingManga = mangaCollection.filter(
    (m) => !mangaList.find((ml) => ml.id === m.id),
  );

  const deletedManga = mangaList.filter(
    (manga) => !mangaCollection.find((m) => m.id === manga.id),
  );

  const changedManga = mangaList
    .filter((m) => !deletedManga.find((dm) => dm.id === m.id))
    .map((m) => {
      const obj = readMangaMetadataWithId(m.id);

      return {
        mangaId: m.id,
        changes: {
          title: m.title !== obj.title ? obj.title : undefined,
        },
      };
    })
    .filter((c) => !Object.values(c.changes).every((e) => e === undefined));

  console.log("Changed Manga", changedManga);

  console.log(
    "Deleted Manga",
    deletedManga.map((m) => m.id),
  );

  console.log(
    "Missing Manga",
    missingManga.map((m) => m.id),
  );

  const missingChapters = mangaCollection
    .map((manga) => {
      const exists = mangaList.find((m) => m.id === manga.id);
      return manga.chapters
        .filter(
          (chapter) => !exists?.chapters.find((c) => c.index === chapter.index),
        )
        .map((chapter) => ({ mangaId: manga.id, ...chapter }))
        .filter((c) => c !== undefined);
    })
    .flat();

  console.log(
    "Missing Chapters",
    missingChapters.map((c) => `${c.mangaId} : ${c.index}`),
  );

  const deletedChapters = mangaList
    .map((manga) => {
      const collection = mangaCollection.find((m) => m.id === manga.id);
      return manga.chapters.filter((chapter) => {
        return !collection?.chapters.find((c) => c.index === chapter.index);
      });
    })
    .flat();

  console.log(
    "Deleted Chapters",
    deletedChapters.map((c) => `${c.mangaId} : ${c.index}`),
  );

  const compareStringArrays = (a: string[], b: string[]) =>
    a.length === b.length && a.every((element, index) => element === b[index]);

  const chapterChanges = mangaList
    .map((manga) => {
      const collection = mangaCollection.find((m) => m.id === manga.id);
      return manga.chapters.map((chapter) => {
        const colChapter = collection?.chapters.find(
          (c) => c.index === chapter.index,
        );

        return {
          mangaId: manga.id,
          chapterIndex: chapter.index,
          changes: {
            name:
              chapter.name != colChapter?.name ? colChapter?.name : undefined,
            pages:
              colChapter &&
              !compareStringArrays(chapter.pages, colChapter.pages)
                ? colChapter.pages
                : undefined,
          },
        };
      });
    })
    .flat()
    .filter((c) => !Object.values(c.changes).every((e) => e === undefined));

  console.log("Chapter Changes", chapterChanges);

  // for (let manga of deletedManga) {
  //   // TODO(patrik): Temp
  //   await db.delete(mangas).where(eq(mangas.id, manga.id));
  // }

  // for (let manga of missingManga) {
  //   await db.insert(mangas).values({
  //     ...manga,
  //     cover: "cover.png",
  //   });
  // }

  // for (let chapter of missingChapters) {
  //   await db.insert(chapters).values({
  //     ...chapter,
  //     cover: chapter.pages[0],
  //   });
  // }

  // for (const manga of changedManga) {
  //   await db
  //     .update(mangas)
  //     .set(manga.changes)
  //     .where(eq(mangas.id, manga.mangaId));
  // }
}

sync()
  .then(() => console.log("Sync Successfull"))
  .catch((e) => console.log("Err", e));

// setInterval(() => {
//   sync()
//     .then(() => console.log("Sync Successfull"))
//     .catch((e) => console.log("Err", e));
// }, 10000);

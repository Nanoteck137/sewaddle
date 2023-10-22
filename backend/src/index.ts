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
import { and, eq } from "drizzle-orm";
import { readMangaMetadataFromDir } from "./util/manga";

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
    res.sendFile(params.image, { root: p });
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

async function syncDatabase() {
  const entries = (await fs.readdir(env.TARGET_PATH)).filter(
    (e) => e !== "cache",
  );

  const mangaList = await db.query.mangas.findMany({
    where: eq(mangas.available, true),
    with: {
      chapters: {
        where: eq(chapters.available, true),
      },
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
      const obj = mangaCollection.find((mc) => mc.id === m.id);

      return {
        mangaId: m.id,
        changes: {
          title: obj && m.title !== obj.title ? obj.title : undefined,
          cover: obj && m.cover !== obj.cover ? obj.cover : undefined,
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

  const changedChapters = mangaList
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

  console.log("Chapter Changes", changedChapters);

  for (const chapter of deletedChapters) {
    await db
      .update(chapters)
      .set({ available: false })
      .where(
        and(
          eq(chapters.mangaId, chapter.mangaId),
          eq(chapters.index, chapter.index),
        ),
      );
  }

  for (let manga of deletedManga) {
    await db
      .update(mangas)
      .set({ available: false })
      .where(eq(mangas.id, manga.id));
  }

  for (let manga of missingManga) {
    console.log(manga);
    await db
      .insert(mangas)
      .values({
        ...manga,
      })
      .onConflictDoUpdate({
        target: mangas.id,
        set: { available: true },
      });
  }

  for (let chapter of missingChapters) {
    await db
      .insert(chapters)
      .values({
        ...chapter,
        cover: chapter.pages[0],
      })
      .onConflictDoUpdate({
        target: [chapters.mangaId, chapters.index],
        set: { ...chapter, available: true },
      });
  }

  for (const manga of changedManga) {
    await db
      .update(mangas)
      .set(manga.changes)
      .where(eq(mangas.id, manga.mangaId));
  }

  for (const chapter of changedChapters) {
    await db
      .update(chapters)
      .set(chapter.changes)
      .where(
        and(
          eq(chapters.mangaId, chapter.mangaId),
          eq(chapters.index, chapter.chapterIndex),
        ),
      );
  }
}

// TODO(patrik): Detect deletion
async function syncTarget() {
  const entries = (await fs.readdir(env.COLLECTION_PATH)).filter((e) =>
    isValidEntry(path.join(env.COLLECTION_PATH, e)),
  );
  console.log(entries);

  if (existsSync(env.TARGET_PATH)) {
    (await fs.readdir(env.TARGET_PATH)).forEach((e) => {
      fs.unlink(path.join(env.TARGET_PATH, e));
    });
  } else {
    await fs.mkdir(env.TARGET_PATH, { recursive: true });
  }

  entries.forEach((e) => {
    const src = path.resolve(path.join(env.COLLECTION_PATH, e));
    const metadata = readMangaMetadataFromDir(src);
    const dest = path.join(env.TARGET_PATH, metadata.id.toString());
    if (!existsSync(dest)) {
      fs.symlink(src, dest);
    }
  });
}

async function fullSync() {
  await syncTarget();
  console.log("Target syncing successful");

  await syncDatabase();
  console.log("Database syncing successful");
}

fullSync().catch(console.error);

// setInterval(() => {
//   syncDatabase()
//     .then(() => console.log("Sync Successfull"))
//     .catch((e) => console.log("Err", e));
// }, 10000);

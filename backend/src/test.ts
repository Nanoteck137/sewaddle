import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, gt, lt, sql } from "drizzle-orm";
import { Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getFilePath } from "hono/utils/filepath";
import { getMimeType } from "hono/utils/mime";
import { ReadStream, createReadStream, existsSync, lstatSync } from "node:fs";
import { AnyZodObject, z } from "zod";
import { db } from "./db";
import { getTargetDir } from "./env";
import { chapters, mangas } from "./schema";

const app = new Hono();

function jsonValidator(schema: AnyZodObject) {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.flatten().fieldErrors, 400);
    }
  });
}

const createStreamBody = (stream: ReadStream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },

    cancel() {
      stream.destroy();
    },
  });
  return body;
};

function sendFile(c: Context, path: string): Response {
  if (!existsSync(path)) {
    throw new HTTPException(404);
  }

  const mimeType = getMimeType(path);
  if (mimeType) {
    c.header("Content-Type", mimeType);
  }

  const stat = lstatSync(path);
  const size = stat.size;

  if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
    c.header("Content-Length", size.toString());
    c.status(200);
    return c.body(null);
  }

  c.header("Content-Length", size.toString());
  const maxAge = 86400 * 30 * 1000;
  c.header("Cache-Control", `public, max-age=${maxAge}`);
  return c.body(createStreamBody(createReadStream(path)), 200);
}

app.get("/image/manga/:mangaId/:image", (c) => {
  const mangaId = c.req.param("mangaId");
  const image = c.req.param("image");

  const filename = `${mangaId}/images/${image}`;
  let path = getFilePath({
    filename,
    root: getTargetDir(),
  });

  if (!path) {
    throw new HTTPException(404);
  }

  return sendFile(c, path);
});

app.get("/image/chapter/:mangaId/:chapterIndex/:image", (c) => {
  const mangaId = c.req.param("mangaId");
  const chapterIndex = c.req.param("chapterIndex");
  const image = c.req.param("image");

  const filename = `${mangaId}/chapters/${chapterIndex}/${image}`;
  let path = getFilePath({
    filename,
    root: getTargetDir(),
  });

  if (!path) {
    throw new HTTPException(404);
  }

  return sendFile(c, path);
});

app.get("/api/serie/list", async (c) => {
  const chapterCount = db
    .select({
      mangaId: chapters.mangaId,
      count: sql<number>`COUNT(${chapters.index})`.as("count"),
    })
    .from(chapters)
    .groupBy(chapters.mangaId)
    .as("chapterCount");

  const res = await db
    .select({
      id: mangas.id,
      title: mangas.title,
      cover: mangas.cover,
      chapters: chapterCount.count,
    })
    .from(mangas)
    .where(eq(mangas.available, true))
    .leftJoin(chapterCount, eq(chapterCount.mangaId, mangas.id))
    .orderBy(mangas.title);

  return c.json(
    res.map((manga) => ({
      ...manga,
      cover: `/image/manga/${manga.id}/${manga.cover}`,
    })),
  );
});

async function getMangaDetails(mangaId: string) {
  // const user = ctx.userId
  //   ? {
  //       saved: !!(await db.query.userSavedMangas.findFirst({
  //         where: and(
  //           eq(userSavedMangas.userId, ctx.userId ?? ""),
  //           eq(userSavedMangas.mangaId, input.mangaId),
  //         ),
  //       })),
  //     }
  //   : undefined;
  const user = undefined;

  const manga = await db.query.mangas.findFirst({
    where: eq(mangas.id, mangaId),
    with: {
      chapters: {
        columns: {
          index: true,
          name: true,
          cover: true,
        },
        where: eq(chapters.available, true),
      },
    },
  });

  if (!manga) {
    return null;
  }

  return {
    ...manga,
    chapters: manga.chapters.map((chapter) => {
      return {
        ...chapter,
        cover: `/image/chapter/${manga.id}/${chapter.index}/${chapter.cover}`,
      };
    }),
    cover: `/image/manga/${manga.id}/${manga.cover}`,
    user,
  };
}

app.get("/api/serie/:mangaId/details", async (c) => {
  const mangaId = c.req.param("mangaId");
  const data = await getMangaDetails(mangaId);

  if (!data) {
    return c.json({ message: "Manga not found" }, 404);
  }

  return c.json(data);
});

async function getChapter(mangaId: string, chapterIndex: number) {
  const result = await db.query.chapters.findFirst({
    where: and(
      eq(chapters.mangaId, mangaId),
      eq(chapters.index, chapterIndex),
    ),
  });

  if (!result) {
    return null;
  }

  const next = db
    .select({ index: chapters.index })
    .from(chapters)
    .where(
      and(eq(chapters.mangaId, mangaId), gt(chapters.index, result.index)),
    )
    .limit(1);
  const prev = db
    .select({ index: chapters.index })
    .from(chapters)
    .where(
      and(eq(chapters.mangaId, mangaId), lt(chapters.index, result.index)),
    )
    .orderBy(desc(chapters.index))
    .limit(1);

  const res = await Promise.all([next, prev]);

  const nextIndex = res[0].at(0);
  const prevIndex = res[1].at(0);

  return {
    ...result,
    pages: result.pages.map(
      (page) => `/image/chapter/${result.mangaId}/${result.index}/${page}`,
    ),
    cover: `/image/chapter/${result.mangaId}/${result.index}/${result.cover}`,
    nextChapter: nextIndex?.index ?? null,
    prevChapter: prevIndex?.index ?? null,
  };
}

app.get(
  "/api/serie/:mangaId/chapter/:chapterIndex",
  zValidator(
    "param",
    z.object({
      mangaId: z.string(),
      chapterIndex: z.string().refine(
        (val) => {
          const n = Number(val);
          return !isNaN(n);
        },
        { message: "chapterIndex must be a number" },
      ),
    }),

    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten().fieldErrors, 400);
      }
    },
  ),
  async (c) => {
    const mangaId = c.req.param("mangaId");
    const chapterIndex = parseInt(c.req.param("chapterIndex"));
    const chapter = await getChapter(mangaId, chapterIndex);

    if (!chapter) {
      return c.json({ message: "Chapter not found" }, 404);
    }

    return c.json(chapter);
  },
);

app.showRoutes();

serve(app, (info) => {
  console.log(`Listening on http://${info.address}:${info.port}`);
});

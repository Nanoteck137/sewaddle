import { serve } from "@hono/node-server";
import { eq, sql } from "drizzle-orm";
import { Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getFilePath } from "hono/utils/filepath";
import { getMimeType } from "hono/utils/mime";
import { ReadStream, createReadStream, existsSync, lstatSync } from "node:fs";
import { db } from "./db";
import { getTargetDir } from "./env";
import { chapters, mangas } from "./schema";

const app = new Hono();

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

app.get("/api/series/all", async (c) => {
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

app.showRoutes();

serve(app, (info) => {
  console.log(`Listening on http://${info.address}:${info.port}`);
});

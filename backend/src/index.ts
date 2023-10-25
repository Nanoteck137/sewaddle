import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { existsSync } from "fs";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import path from "path";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import { ZodError, z } from "zod";
import { appRouter } from "./api/router";
import { db } from "./db";
import { env, getCollectionDir, getTargetDir } from "./env";
import { chapters, mangas } from "./schema";
import { Context } from "./trpc";
import { and, eq } from "drizzle-orm";
import { readMangaMetadataFromDir } from "./util/manga";
import * as config from "./config";
import imageRouter from "./routes/image";
import { fullSync } from "./sync";

config.initialize().then(() => console.log("Config Initialized"));

const TokenSchema = z.object({ userId: z.string().cuid2() });

function checkToken(token: string) {
  const j = jwt.verify(token, env.JWT_SECRET);
  const o = TokenSchema.safeParse(j);
  if (o.success) {
    return o.data.userId;
  }

  return null;
}

function createContextInner(token: string | null): Context {
  const userId = token ? checkToken(token) : null;

  return {
    config: config.config,
    userId,
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

app.use("/image", imageRouter);

if (env.NODE_ENV !== "development") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public/index.html"));
  });
}

app.listen(3000, () => console.log("Server started on port '3000'"));

fullSync()
  .then(() => console.log("Sync completed"))
  .catch(console.error);

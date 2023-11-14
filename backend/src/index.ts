import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import path from "path";
import { z } from "zod";
import { appRouter } from "./api/router";
import * as config from "./config";
import { runMigrations } from "./db";
import { env } from "./env";
import apiRouter from "./routes/api";
import imageRouter from "./routes/image";
import { fullSync } from "./sync";
import { Context } from "./trpc";

async function start() {
  await runMigrations();

  await config.initialize();
  console.log("Configuration initialized");

  await fullSync();
  console.log("Sync completed");
}

start().then(() => console.log("Start run"));

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

app.use(cors());
if (env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: ["'self'", "https://placehold.co/"],
          scriptSrc: ["'self'"],
        },
      },
    }),
  );
}
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => {
      const auth = req.headers.authorization;
      const token = auth?.split(" ").at(1);

      return createContextInner(token ?? null);
    },
  }),
);

app.use("/api", apiRouter);
app.use("/image", imageRouter);

if (env.NODE_ENV !== "development") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public/index.html"));
  });
}

app.listen(3000, () => console.log("Server started on port '3000'"));

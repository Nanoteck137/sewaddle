import "./env";

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import { appRouter } from "./api/router";
import { Context } from "./trpc";
import path from "path";
import morgan from "morgan";
import env from "./env";

function createContextInner(): Context {
  return {};
}

const app = express();

app.use(cors());
// app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(env.NODE_ENV == "development" ? "dev" : "combined"));

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
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => createContextInner(),
  }),
);

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/index.html"));
});

app.listen(3000);

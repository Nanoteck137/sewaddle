import type { Config } from "drizzle-kit";

import { env } from "./src/env";

export default {
  schema: "./src/schema.ts",
  driver: "better-sqlite",
  out: "./migrations",
  dbCredentials: {
    url: env.DATABASE_PATH,
  },
} satisfies Config;

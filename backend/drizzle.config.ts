import type { Config } from "drizzle-kit";

import { env, getDatabaseFile } from "./src/env";

export default {
  schema: "./src/schema.ts",
  driver: "better-sqlite",
  out: "./migrations",
  dbCredentials: {
    url: getDatabaseFile(),
  },
} satisfies Config;

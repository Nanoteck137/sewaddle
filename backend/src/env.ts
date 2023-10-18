import { z } from "zod";

import path from "path";
import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
dotenv.config({ path: path.resolve(process.cwd(), "./.env") });

export const env = createEnv({
  server: {
    DATABASE_PATH: z.string(),
    NODE_ENV: z.enum(["production", "development"]).default("development"),
    TARGET_PATH: z.string(),
    JWT_SECRET: z.string(),
  },

  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});

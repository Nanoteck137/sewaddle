import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "./.env") });

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["production", "development"]).default("development"),
    WORKING_DIR: z.string().refine((dir) => fs.existsSync(dir), {
      message: "Directory does not exist",
    }),
    COLLECTION: z.string().optional(),
    JWT_SECRET: z.string(),

    DB_URL: z.string(),
    DB_AUTH_TOKEN: z.string().optional(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

const TARGET_DIR_NAME = "target";
const TEST_DIR_NAME = "test";

export function getTargetDir() {
  return path.join(env.WORKING_DIR, TARGET_DIR_NAME);
}

export function getTestDataDir() {
  return path.join(env.WORKING_DIR, TEST_DIR_NAME, "data");
}

export function getTestCacheDir() {
  return path.join(env.WORKING_DIR, TEST_DIR_NAME, "cache");
}

export function getCollectionDir() {
  return env.COLLECTION || getTestDataDir();
}

export function getDatabaseFile() {
  return path.join(env.WORKING_DIR, "data.db");
}

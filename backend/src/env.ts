import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), "./.env") });

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["production", "development"]).default("development"),
    WORKING_DIR: z.string().refine((dir) => fs.existsSync(dir), {
      message: "Directory does not exist",
    }),
    COLLECTION: z.string().optional(),
    JWT_SECRET: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

const TARGET_DIR_NAME = "target";
const TEST_DIR_NAME = "test";

export function getTargetDir() {
  return path.join(env.WORKING_DIR, TARGET_DIR_NAME);
}

export function getTestDir() {
  return path.join(env.WORKING_DIR, TEST_DIR_NAME);
}

export function getCollectionDir() {
  return env.COLLECTION || getTestDir();
}

export function getDatabaseFile() {
  return path.join(env.WORKING_DIR, "data.db");
}

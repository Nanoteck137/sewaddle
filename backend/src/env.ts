import { z } from "zod";

import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), "./.env") });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const env = EnvSchema.parse(process.env);
export default env;

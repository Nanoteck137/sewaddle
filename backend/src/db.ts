import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "./env";
import * as schema from "./schema";

const client = createClient({ url: env.DB_URL, authToken: env.DB_AUTH_TOKEN });
export const db = drizzle(client, { schema });

if (env.NODE_ENV === "production") {
  migrate(db, { migrationsFolder: "./migrations" });
}

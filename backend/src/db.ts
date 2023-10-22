import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getDatabaseFile } from "./env";
import * as schema from "./schema";

const sqlite = new Database(getDatabaseFile());
export const db = drizzle(sqlite, { schema });

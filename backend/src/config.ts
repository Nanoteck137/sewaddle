import { db } from "./db";
import { ServerConfig, serverConfig } from "./schema";

export let config: ServerConfig | null = null;

export async function initialize() {
  const c = await db.query.serverConfig.findFirst({});
  config = c || null;
  console.log(config);
}

export async function createConfig(owner: string) {
  if (config) return;

  const [newConfig] = await db
    .insert(serverConfig)
    .values({ owner })
    .returning();
  config = newConfig;
}

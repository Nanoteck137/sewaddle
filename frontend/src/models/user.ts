import { z } from "zod";

import { Collection } from "./collection";

export const User = Collection.extend({
  username: z.string(),
});
export type User = z.infer<typeof User>;

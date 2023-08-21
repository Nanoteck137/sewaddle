import { z } from "zod";

import { Collection } from "./base";

export const User = Collection.extend({
  username: z.string(),
});
export type User = z.infer<typeof User>;

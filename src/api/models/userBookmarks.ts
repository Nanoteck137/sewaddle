import { z } from "zod";

import { Collection, Id } from "./base";

export const UserBookmark = Collection.extend({
  user: Id,
  manga: Id,
  chapter: Id,
});
export type UserBookmark = z.infer<typeof UserBookmark>;

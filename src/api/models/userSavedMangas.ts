import { Collection, Id } from "./base";

export const UserSavedManga = Collection.extend({
  user: Id,
  manga: Id,
});

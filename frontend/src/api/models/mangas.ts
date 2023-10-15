import { z } from "zod";

import { Collection } from "./base";

export const Manga = Collection.extend({
  title: z.string(),
  malId: z.number(),
  anilistId: z.number(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (arg) => (arg === "" ? null : arg),
    z.coerce.date().nullish(),
  ),
  color: z.string(),
  banner: z.string(),
  cover: z.string()
});
export type Manga = z.infer<typeof Manga>;

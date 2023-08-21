import { z } from "zod";

import { Collection } from "./base";

export const Manga = Collection.extend({
  name: z.string(),
  englishTitle: z.string(),
  nativeTitle: z.string(),
  romajiTitle: z.string(),
  malUrl: z.string().url(),
  anilistUrl: z.string().url(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (arg) => (arg === "" ? null : arg),
    z.coerce.date().nullish(),
  ),
  color: z.string(),
  isGroup: z.boolean(),
  banner: z.string(),
  coverMedium: z.string(),
  coverLarge: z.string(),
  coverExtraLarge: z.string(),
});
export type Manga = z.infer<typeof Manga>;

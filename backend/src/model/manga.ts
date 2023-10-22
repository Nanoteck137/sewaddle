import { z } from "zod";

export const ChapterMetadata = z.object({
  index: z.number(),
  name: z.string(),
  pages: z.array(z.string()),
});
export type ChapterMetadata = z.infer<typeof ChapterMetadata>;

export const MangaMetadata = z.object({
  id: z.string().cuid2(),
  title: z.string(),
  cover: z.string(),
  chapters: z.array(ChapterMetadata),
});
export type MangaMetadata = z.infer<typeof MangaMetadata>;

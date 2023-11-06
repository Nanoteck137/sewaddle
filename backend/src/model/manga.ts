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

  description: z.string(),
  anilistId: z.number(),
  malId: z.number(),
  status: z.enum(["RELEASING", "FINISHED", "HIATUS"]),
  startDate: z.string(),
  endDate: z.string(),
});
export type MangaMetadata = z.infer<typeof MangaMetadata>;

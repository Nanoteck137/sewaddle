import { API_URL } from "$env/static/private";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

const Chapter = z.object({
  index: z.number(),
  name: z.string(),
  mangaId: z.string().cuid2(),
  cover: z.string(),
  pages: z.array(z.string()),
  available: z.boolean(),
  nextChapter: z.number().nullish(),
  prevChapter: z.number().nullish(),
});

export const load: PageServerLoad = async ({ fetch, params, url }) => {
  const res = await fetch(
    `${API_URL}/api/serie/${params.series}/chapter/${params.chapter}`,
  );

  if (res.status === 404) {
    throw error(404, {
      message: "Chapter not found",
    });
  }

  if (res.status !== 200) {
    throw new Error(`Unknown Error: ${res.status}`);
  }

  return {
    chapter: Chapter.parse(await res.json()),
  };
};

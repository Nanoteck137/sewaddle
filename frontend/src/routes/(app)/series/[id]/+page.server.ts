import { API_URL } from "$env/static/private";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

// function createServerSchema<T extends z.ZodTypeAny>(data: T) {
//   return z.object({
//     success: z.literal(true),
//     data,
//   });
// }

const SerieDetails = z.object({
  id: z.string().cuid2(),
  title: z.string(),
  anilistId: z.number(),
  malId: z.number(),
  description: z.string(),
  color: z.string().nullish(),
  status: z.enum(["RELEASING", "FINISHED", "HIATUS"]),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  cover: z.string(),
  available: z.boolean(),
  chapters: z.array(z.object({
    index: z.number(),
    name: z.string(),
    cover: z.string()
  }))
});

export const load: PageServerLoad = async ({ fetch, params }) => {
  const res = await fetch(`${API_URL}/api/serie/${params.id}/details`);
  if (res.status === 404) {
    throw error(404, {
      message: "Manga not found",
    });
  }

  if (res.status !== 200) {
    throw new Error(`Unknown Error: ${res.status}`);
  }

  const details = SerieDetails.parse(await res.json());
  return {
    details,
  };
};

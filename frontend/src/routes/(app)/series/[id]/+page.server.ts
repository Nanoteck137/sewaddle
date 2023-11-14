import { API_URL } from "$env/static/private";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

const SerieDetails = z.object({
  id: z.string().cuid2(),
  title: z.string(),
  anilistId: z.number(),
  malId: z.number(),
  description: z.string(),
  color: z.string().nullish(),
  status: z.enum(["RELEASING"]),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  cover: z.string(),
  available: z.boolean(),
});

export const load: PageServerLoad = async ({ fetch, params }) => {
  const res = await fetch(`${API_URL}/api/serie/${params.id}/details`);
  const j = await res.json();

  return {
    details: SerieDetails.parse(j)
  }
};

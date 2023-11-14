import { API_URL } from "$env/static/private";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

const ListItem = z.object({
  id: z.string().cuid2(),
  title: z.string(),
  cover: z.string(),
  chapters: z.number(),
});

const List = z.array(ListItem);

export const load: PageServerLoad = async ({ fetch }) => {
  const res = await fetch(`${API_URL}/api/serie/list`);
  const j = await res.json();

  return {
    list: List.parse(j)
  }
};

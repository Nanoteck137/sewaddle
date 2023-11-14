import { API_URL } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({url}) => {
  return await fetch(`${API_URL}${url.pathname}`);
}

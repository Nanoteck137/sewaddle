import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const serie = await locals.apiClient.getSerieById(params.id);
  if (!serie.success) {
    throw error(serie.error.code, { message: serie.error.message });
  }

  const chapters = await locals.apiClient.getSerieChapters(params.id);
  if (!chapters.success) {
    throw error(chapters.error.code, { message: chapters.error.message });
  }

  return {
    serie: serie.data,
    chapters: chapters.data.chapters,
  };
};

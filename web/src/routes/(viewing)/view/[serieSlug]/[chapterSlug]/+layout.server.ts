import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, params }) => {
  const chapter = await locals.apiClient.getChapterBySlug(
    params.serieSlug,
    params.chapterSlug,
  );

  if (!chapter.success) {
    throw error(chapter.error.code, { message: chapter.error.message });
  }

  return {
    chapter: chapter.data,
  };
};

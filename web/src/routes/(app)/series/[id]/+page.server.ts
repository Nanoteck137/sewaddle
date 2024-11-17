import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

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

export const actions: Actions = {
  markChapters: async ({ locals, request }) => {
    if (!locals.user) throw error(400, "Not logged in");

    const formData = await request.formData();

    const chapters = formData.getAll("chapters[]");
    if (chapters.length > 0) {
      const chapterSlugs = chapters.map((c) => c.toString());
      const res = await locals.apiClient.markChapters({
        chapters: chapterSlugs,
      });

      if (!res.success) {
        throw error(res.error.code, { message: res.error.message });
      }
    }
  },

  unmarkChapters: async ({ locals, request }) => {
    if (!locals.user) throw error(400, "Not logged in");

    const formData = await request.formData();

    const chapters = formData.getAll("chapters[]");
    if (chapters.length > 0) {
      const chapterIds = chapters.map((c) => c.toString());
      const res = await locals.apiClient.unmarkChapters({
        chapters: chapterIds,
      });

      if (!res.success) {
        throw error(res.error.code, { message: res.error.message });
      }
    }
  },

  setBookmark: async ({ locals, request }) => {
    if (!locals.user) throw error(400, "Not logged in");

    const formData = await request.formData();

    const serieId = formData.get("serieId");
    if (!serieId) {
      throw error(500, "'serieId' not set");
    }

    const chapterId = formData.get("chapterId");
    if (!chapterId) {
      throw error(500, "'chapterId' not set");
    }

    const res = await locals.apiClient.updateBookmark({
      serieId: serieId.toString(),
      chapterId: chapterId.toString(),
      page: 0,
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }
  },
};

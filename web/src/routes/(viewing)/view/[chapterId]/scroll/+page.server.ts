import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  updateAndNextChapter: async ({ locals, request }) => {
    const formData = await request.formData();

    const currentChapterId = formData.get("currentChapterId");
    if (!currentChapterId) {
      throw error(500, "Missing 'currentChapterId'");
    }

    const nextChapterId = formData.get("nextChapterId");
    if (!nextChapterId) {
      throw error(500, "Missing 'nextChapterId'");
    }

    const res = await locals.apiClient.markChapters({
      chapters: [currentChapterId.toString()],
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }

    throw redirect(301, `/view/${nextChapterId}/scroll`);
  },

  bookmarkChapter: async ({ locals, request }) => {
    const formData = await request.formData();
    const serieSlug = formData.get("serieSlug");
    if (!serieSlug) {
      throw error(500, "Missing 'serieSlug'");
    }

    const chapterSlug = formData.get("chapterSlug");
    if (!chapterSlug) {
      throw error(500, "Missing 'chapterSlug'");
    }

    const res = await locals.apiClient.updateBookmark({
      serieSlug: serieSlug.toString(),
      chapterSlug: chapterSlug.toString(),
      page: 0,
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }
  },
};

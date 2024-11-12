import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  updateAndNextChapter: async ({ locals, request }) => {
    const formData = await request.formData();
    const serieSlug = formData.get("serieSlug");
    if (!serieSlug) {
      throw error(500, "Missing 'serieSlug'");
    }

    const currentChapterSlug = formData.get("currentChapterSlug");
    if (!currentChapterSlug) {
      throw error(500, "Missing 'currentChapterSlug'");
    }

    const nextChapterSlug = formData.get("nextChapterSlug");
    if (!nextChapterSlug) {
      throw error(500, "Missing 'nextChapterSlug'");
    }

    const res = await locals.apiClient.markChapters({
      serieSlug: serieSlug.toString(),
      chapters: [currentChapterSlug.toString()],
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }

    throw redirect(301, `/view/${serieSlug}/${nextChapterSlug}/scroll`);
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

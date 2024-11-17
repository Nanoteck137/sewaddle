import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  updateAndNextChapter: async ({ locals, request }) => {
    const formData = await request.formData();

    const serieId = formData.get("serieId");
    if (!serieId) {
      throw error(500, "Missing 'serieId'");
    }

    const currentChapterId = formData.get("currentChapterId");
    if (!currentChapterId) {
      throw error(500, "Missing 'currentChapterId'");
    }

    const nextChapterId = formData.get("nextChapterId");
    if (!nextChapterId) {
      throw error(500, "Missing 'nextChapterId'");
    }

    if (locals.user) {
      {
        const res = await locals.apiClient.markChapters({
          chapters: [currentChapterId.toString()],
        });

        if (!res.success) {
          throw error(res.error.code, { message: res.error.message });
        }
      }

      {
        const res = await locals.apiClient.updateBookmark({
          serieId: serieId.toString(),
          chapterId: nextChapterId.toString(),
          page: 0,
        });

        if (!res.success) {
          throw error(res.error.code, { message: res.error.message });
        }
      }
    }

    throw redirect(301, `/view/${nextChapterId}/scroll`);
  },

  bookmarkChapter: async ({ locals, request }) => {
    const formData = await request.formData();
    const serieId = formData.get("serieId");
    if (!serieId) {
      throw error(500, "Missing 'serieId'");
    }

    const chapterId = formData.get("chapterId");
    if (!chapterId) {
      throw error(500, "Missing 'chapterId'");
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

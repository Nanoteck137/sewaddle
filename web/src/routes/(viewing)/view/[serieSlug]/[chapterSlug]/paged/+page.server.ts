import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

type Layout = "paged" | "scroll";

function parseQueryBool(q: string | null) {
  return q === "true";
}

export const load: PageServerLoad = async ({ params }) => {
  // TODO(patrik): Temp
  throw redirect(
    301,
    `/view/${params.serieSlug}/${params.chapterSlug}/scroll`,
  );

  // const layoutParam = url.searchParams.get("layout");
  // const showLastPageModal = parseQueryBool(
  //   url.searchParams.get("showLastPageModal"),
  // );

  // let layout: Layout = "paged";
  // if (layoutParam === "scroll") {
  //   layout = "scroll";
  // }

  // const page = url.searchParams.get("page");
  // if (!page && layout === "paged") {
  //   throw redirect(301, url.pathname + "?page=0");
  // }

  // const chapter = await locals.apiClient.getChapterBySlug(
  //   params.serieSlug,
  //   params.chapterSlug,
  // );
  // if (!chapter.success) {
  //   throw error(chapter.error.code, { message: chapter.error.message });
  // }

  // let pageNum = 0;
  // if (layout === "paged") {
  //   if (page === "last") {
  //     throw redirect(
  //       301,
  //       url.pathname + "?page=" + (chapter.data.pages.length - 1).toString(),
  //     );
  //   } else {
  //     pageNum = parseInt(page || "0");
  //   }
  // }

  // const isFirstPage = pageNum <= 0;
  // const isLastPage = pageNum >= chapter.data.pages.length - 1;

  return {
    // chapter: chapter.data,
    // page: pageNum,
    // isFirstPage,
    // isLastPage,
    // layout,
    // showLastPageModal,
  };
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

    const layout = formData.get("layout");
    if (!layout) {
      throw error(500, "Missing 'layout'");
    }

    const res = await locals.apiClient.markChapters({
      serieSlug: serieSlug.toString(),
      chapters: [currentChapterSlug.toString()],
    });

    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }

    throw redirect(
      301,
      `/view/${serieSlug}/${nextChapterSlug}?layout=${layout}`,
    );
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

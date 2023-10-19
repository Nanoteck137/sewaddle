import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { apiEndpoint } from "@/App";
import { trpc } from "@/trpc";
import { useAuth } from "../contexts/AuthContext";

const ViewPage = () => {
  const { mangaId, chapterIndex } = useParams();
  const [search, setSearch] = useSearchParams();

  const navigate = useNavigate();

  const auth = useAuth();

  const [state, setState] = useState({
    currentPage: 0,
    isLastPage: false,
  });

  // const chapterQuery = useChapter({ chapterId: id });

  const chapter = trpc.manga.viewChapter.useQuery(
    {
      mangaId: mangaId || "",
      chapterIndex: parseInt(chapterIndex || ""),
    },
    { enabled: !!mangaId && !!chapterIndex },
  );

  // const updateUserBookmark = useUpdateUserBookmark();
  const updateUserBookmark = trpc.manga.updateUserBookmark.useMutation();
  const markChapters = trpc.manga.markChapters.useMutation();

  // const markUserChapters = useMarkUserChapters();

  useHotkeys(["j", "left"], () => nextPage());
  useHotkeys(["k", "right"], () => prevPage());

  const nextPage = () => {
    const page = state.currentPage + 1;
    if (page < data.pages.length) {
      setState((prev) => ({ ...prev, currentPage: page }));
      setSearch({ page: page.toString() });
    } else {
      if (chapter.data && chapter.data.nextChapter) {
        if (state.isLastPage) {
          navigate(
            `/view/${chapter.data.mangaId}/${chapter.data.nextChapter}?page=0`,
          );
        } else {
          setState((prev) => ({ ...prev, isLastPage: true }));
          markChapters.mutate({
            mangaId: chapter.data.mangaId,
            chapters: [chapter.data.index],
          });
          // if (auth.user && id) {
          //   markUserChapters.mutate({ user: auth.user, chapterIds: [id] });
          // }
        }
      }
    }
  };

  const prevPage = () => {
    const page = state.currentPage - 1;
    if (page >= 0) {
      setState((prev) => ({ ...prev, currentPage: page }));
      setSearch({ page: page.toString() });
      if (state.isLastPage) {
        setState((prev) => ({ ...prev, isLastPage: false }));
      }
    } else {
      if (chapter.data && chapter.data.prevChapter) {
        navigate(
          `/view/${chapter.data.mangaId}/${chapter.data.prevChapter}?page=`,
        );
      }
    }
  };

  useEffect(() => {
    const page = search.get("page");
    if (page !== null && chapter.data) {
      if (page === "") {
        const page = chapter.data.pages.length - 1;
        setState((prev) => ({
          ...prev,
          currentPage: page,
        }));
      } else {
        const n = parseInt(page);
        if (n >= 0 && n < chapter.data.pages.length) {
          setState((prev) => ({
            ...prev,
            currentPage: n,
          }));
        }
      }
    }
  }, [chapter.data, search]);

  useEffect(() => {
    // NOTE(patrik): Need to reset the state when we navigate to
    // the next chapter
    setState({
      currentPage: 0,
      isLastPage: false,
    });
  }, [chapterIndex]);

  useEffect(() => {
    if (chapter.data) {
      updateUserBookmark.mutate({
        mangaId: chapter.data.mangaId,
        chapterIndex: chapter.data.index,
        page: state.currentPage,
      });
    }
  }, [auth.user, chapter.data, state.currentPage]);

  if (chapter.isError) return <p>Error</p>;
  if (chapter.isLoading) return <p>Loading...</p>;

  const { data } = chapter;

  const getCurrentPageUrl = () => {
    // TODO(patrik): If currentPage > page length just clamp it
    // return pb.getFileUrl(data, data.pages[state.currentPage]);
    return `${apiEndpoint}${data.pages[state.currentPage]}`;
  };

  return (
    <div className="relative flex h-full w-full justify-center">
      <button
        className="absolute left-0 h-full w-1/2 cursor-w-resize"
        onClick={nextPage}
      ></button>

      <img
        className={"h-full border-2 object-scale-down dark:border-gray-600"}
        src={getCurrentPageUrl()}
        alt=""
      />

      <button
        className="absolute right-0 h-full w-1/2 cursor-e-resize"
        onClick={prevPage}
      ></button>

      {state.isLastPage && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-700/95 p-10 text-xl">
          Last page
        </div>
      )}
    </div>
  );
};

export default ViewPage;

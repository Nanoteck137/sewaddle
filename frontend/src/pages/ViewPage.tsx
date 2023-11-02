import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

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

  const chapter = trpc.manga.viewChapter.useQuery(
    {
      mangaId: mangaId || "",
      chapterIndex: parseInt(chapterIndex || ""),
    },
    { enabled: !!mangaId && !!chapterIndex },
  );

  const updateUserBookmark = trpc.manga.updateUserBookmark.useMutation();
  const markChapters = trpc.manga.markChapters.useMutation();

  useHotkeys(["j", "left"], () => nextPage());
  useHotkeys(["k", "right"], () => prevPage());

  const nextPage = () => {
    const page = state.currentPage + 1;
    if (page < data.pages.length) {
      setState((prev) => ({ ...prev, currentPage: page }));
      setSearch({ page: page.toString() });
    } else {
      if (chapter.data) {
        if (state.isLastPage && chapter.data.nextChapter) {
          navigate(
            `/view/${chapter.data.mangaId}/${chapter.data.nextChapter}?page=0`,
          );
          return;
        }

        setState((prev) => ({ ...prev, isLastPage: true }));
        markChapters.mutate({
          mangaId: chapter.data.mangaId,
          chapters: [chapter.data.index],
        });
      }
      // if (chapter.data && chapter.data.nextChapter) {
      //   if (state.isLastPage) {
      //     navigate(
      //       `/view/${chapter.data.mangaId}/${chapter.data.nextChapter}?page=0`,
      //     );
      //   } else {
      //     setState((prev) => ({ ...prev, isLastPage: true }));
      //     markChapters.mutate({
      //       mangaId: chapter.data.mangaId,
      //       chapters: [chapter.data.index],
      //     });
      //   }
      // } else if (chapter.data && page >= chapter.data.pages.length) {
      //   markChapters.mutate({
      //     mangaId: chapter.data.mangaId,
      //     chapters: [chapter.data.index],
      //   });
      // }
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
    if (auth.user && chapter.data) {
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
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col justify-center gap-2 rounded bg-gray-700/95 p-10 text-xl">
          <p className="text-center">Last page</p>
          <Link
            to={`/series/${chapter.data.mangaId}`}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Back to Manga
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewPage;

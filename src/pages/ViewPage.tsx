import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  useChapter,
  useChapterNeighbours,
  useMarkUserChapters,
  useUpdateUserBookmark,
} from "../api";
import { pb } from "../api/pocketbase";
import { useAuth } from "../contexts/AuthContext";

const ViewPage = () => {
  const { id } = useParams();
  const [search, setSearch] = useSearchParams();

  const navigate = useNavigate();

  const auth = useAuth();

  const [state, setState] = useState({
    currentPage: 0,
    isLastPage: false,
  });

  const chapterQuery = useChapter({ chapterId: id });

  const chapterNeighbours = useChapterNeighbours({
    chapter: chapterQuery.data,
  });
  console.log(chapterNeighbours.data);

  const updateUserBookmark = useUpdateUserBookmark();

  const markUserChapters = useMarkUserChapters();

  useHotkeys(["j", "left"], () => nextPage());
  useHotkeys(["k", "right"], () => prevPage());

  const nextPage = () => {
    const page = state.currentPage + 1;
    if (page < data.pages.length) {
      setState((prev) => ({ ...prev, currentPage: page }));
      setSearch({ page: page.toString() });
    } else {
      if (chapterNeighbours.data && chapterNeighbours.data.next) {
        if (state.isLastPage) {
          navigate(`/view/${chapterNeighbours.data.next}?page=0`);
        } else {
          setState((prev) => ({ ...prev, isLastPage: true }));
          if (auth.user && id) {
            markUserChapters.mutate({ user: auth.user, chapterIds: [id] });
          }
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
      if (chapterNeighbours.data && chapterNeighbours.data.prev) {
        navigate(`/view/${chapterNeighbours.data.prev}?page=`);
      }
    }
  };

  useEffect(() => {
    const page = search.get("page");
    if (page !== null && chapterQuery.data) {
      if (page === "") {
        const page = chapterQuery.data.pages.length - 1;
        setState((prev) => ({
          ...prev,
          currentPage: page,
        }));
      } else {
        const n = parseInt(page);
        if (n >= 0 && n < chapterQuery.data.pages.length) {
          setState((prev) => ({
            ...prev,
            currentPage: n,
          }));
        }
      }
    }
  }, [chapterQuery.data, search]);

  useEffect(() => {
    // NOTE(patrik): Need to reset the state when we navigate to
    // the next chapter
    setState({
      currentPage: 0,
      isLastPage: false,
    });
  }, [id]);

  useEffect(() => {
    if (auth.user && chapterQuery.data) {
      updateUserBookmark.mutate({
        user: auth.user,
        mangaId: chapterQuery.data.manga,
        chapterId: chapterQuery.data.id,
        page: state.currentPage,
      });
    }
  }, [auth.user, chapterQuery.data, state.currentPage]);

  if (chapterQuery.isError) return <p>Error</p>;
  if (chapterQuery.isLoading) return <p>Loading...</p>;

  const { data } = chapterQuery;

  const getCurrentPageUrl = () => {
    // TODO(patrik): If currentPage > page length just clamp it
    return pb.getFileUrl(data, data.pages[state.currentPage]);
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

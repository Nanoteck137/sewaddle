import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useChapter, useNextChapter, usePrevChapter } from "../api/manga";
import { pb } from "../api/pocketbase";
import useUserChapterInfo from "../hooks/useUserChapterInfo";

// TODO(patrik): Fix the flickering from the continue panel
const ViewPage = () => {
  const { id } = useParams();
  const [search] = useSearchParams();

  const navigate = useNavigate();

  const chapterQuery = useChapter({ id });
  const nextChapterQuery = useNextChapter({ id });
  const prevChapterQuery = usePrevChapter({ id });

  const userChapter = useUserChapterInfo({ chapterId: id });

  const [state, setState] = useState({
    currentPage: 0,
    isLastPage: false,
    showContinue: false,
    disableContinue: false,
    disableControls: false,
  });

  // const [isLastPage, setLastPage] = useState(false);

  // const [shouldContinue, setContinue] = useState<boolean | null>(null);

  useHotkeys(["j", "left"], () => nextPage());
  useHotkeys(["k", "right"], () => prevPage());

  // TODO(patrik): Instead of this we should set the page query parameter
  // when we navigate to this page
  // useEffect(() => {
  //   if (userChapter.data) {
  //     setCurrentPage(userChapter.data.currentPage);
  //   }
  // }, [userChapter.data]);

  const nextPage = () => {
    const page = state.currentPage + 1;
    if (page < data.pages.length) {
      setState((prev) => ({ ...prev, currentPage: page }));
      userChapter.setPage(page);
    } else {
      if (nextChapter) {
        if (state.isLastPage) {
          navigate(`/view/${nextChapter.next}?page=0`);
        } else {
          setState((prev) => ({ ...prev, isLastPage: true }));
          userChapter.setRead(true);
        }
      }
    }
  };

  const prevPage = () => {
    const page = state.currentPage - 1;
    if (page >= 0) {
      setState((prev) => ({ ...prev, currentPage: page }));
      userChapter.setPage(page);
      if (state.isLastPage) {
        setState((prev) => ({ ...prev, isLastPage: false }));
      }
    } else {
      if (prevChapter) {
        navigate(`/view/${prevChapter.prev}?page=`);
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
          disableContinue: true,
        }));
      } else {
        const n = parseInt(page);
        if (n >= 0 && n < chapterQuery.data.pages.length) {
          setState((prev) => ({
            ...prev,
            currentPage: n,
            disableContinue: true,
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

      showContinue: false,
      disableContinue: false,
      disableControls: false,
    });
  }, [id]);

  useEffect(() => {
    console.log(state);
    if (
      userChapter.data &&
      userChapter.data.currentPage != 0 &&
      !state.disableContinue
    ) {
      setState((prev) => ({
        ...prev,
        showContinue: true,
        disableControls: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        showContinue: false,
        disableControls: false,
      }));
    }
  }, [userChapter.data, state.disableContinue]);

  if (chapterQuery.isError) return <p>Error</p>;
  if (chapterQuery.isLoading) return <p>Loading...</p>;

  const { data } = chapterQuery;
  const { data: nextChapter } = nextChapterQuery;
  const { data: prevChapter } = prevChapterQuery;

  const getCurrentPageUrl = () => {
    return pb.getFileUrl(data, data.pages[state.currentPage]);
  };

  // TODO(patrik): Disable controls if userChapter is null or undefined

  return (
    <div className="relative flex h-full w-full justify-center">
      {state.showContinue && !state.disableContinue && (
        <>
          <div
            className="fixed bottom-0 left-0 right-0 top-0 cursor-pointer bg-black/60"
            onClick={() =>
              setState({
                ...state,
                showContinue: false,
                disableControls: false,
                disableContinue: true,
                currentPage: 0,
              })
            }
          ></div>
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded bg-gray-700 p-10 text-lg">
            <p>
              Do you want to continue page '{userChapter.data?.currentPage}'
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="rounded bg-red-300 px-2 py-1"
                onClick={() =>
                  setState({
                    ...state,
                    showContinue: false,
                    disableControls: false,
                    disableContinue: true,
                    currentPage: userChapter.data?.currentPage || 0,
                  })
                }
              >
                Continue
              </button>
              <button className="rounded bg-red-300 px-2 py-1">Stay</button>
            </div>
          </div>
        </>
      )}

      {!state.disableControls && (
        <button
          className="absolute left-0 h-full w-1/2 bg-red-400/20"
          onClick={nextPage}
        ></button>
      )}

      <img
        className={"h-full border-2 object-scale-down dark:border-gray-600"}
        src={getCurrentPageUrl()}
        alt=""
      />

      {!state.disableControls && (
        <button
          className="absolute right-0 h-full w-1/2 bg-blue-400/20"
          onClick={prevPage}
        ></button>
      )}

      {state.isLastPage && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-700/95 p-10 text-xl">
          Last page
        </div>
      )}
    </div>
  );
};

export default ViewPage;

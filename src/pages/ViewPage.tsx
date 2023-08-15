import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useChapter, useNextChapter, usePrevChapter } from "../api/manga";
import { pb } from "../api/pocketbase";

const ViewPage = () => {
  const { id } = useParams();
  const [search] = useSearchParams();
  console.log("ID", search);

  const navigate = useNavigate();

  const chapterQuery = useChapter({ id });
  const nextChapterQuery = useNextChapter({ id });
  const prevChapterQuery = usePrevChapter({ id });

  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setLastPage] = useState(false);

  useEffect(() => {
    const page = search.get("page");
    console.log("PAGE", page);
    if (page !== null && chapterQuery.data) {
      if (page === "") {
        setCurrentPage(chapterQuery.data.pages.length - 1);
      } else {
        const n = parseInt(page);
        if (n >= 0 && n < chapterQuery.data.pages.length) {
          setCurrentPage(n);
        }
      }
    }
  }, [chapterQuery.data, search]);

  useEffect(() => {
    // NOTE(patrik): Need to reset the state when we navigate to
    // the next chapter
    setCurrentPage(0);
    setLastPage(false);
  }, [id]);

  if (chapterQuery.isError) return <p>Error</p>;
  if (chapterQuery.isLoading) return <p>Loading...</p>;

  const { data } = chapterQuery;
  const { data: nextChapter } = nextChapterQuery;
  const { data: prevChapter } = prevChapterQuery;
  console.log("Next", nextChapter);
  console.log("Prev", prevChapter);

  const nextPage = () => {
    const page = currentPage + 1;
    if (page < data.pages.length) {
      setCurrentPage(page);
    } else {
      if (nextChapter) {
        if (isLastPage) {
          navigate(`/view/${nextChapter.next}`);
        } else {
          setLastPage(true);
        }
      }
    }
  };

  const prevPage = () => {
    const page = currentPage - 1;
    if (page >= 0) {
      setCurrentPage(page);
      if (isLastPage) {
        setLastPage(false);
      }
    } else {
      if (prevChapter) {
        navigate(`/view/${prevChapter.prev}?page=`);
      }
    }
  };

  const getCurrentPageUrl = () => {
    return pb.getFileUrl(data, data.pages[currentPage]);
  };

  return (
    <div className="relative flex h-full w-full justify-center">
      <button
        className="absolute left-0 h-full w-1/2 bg-red-400/20"
        onClick={nextPage}
      ></button>

      <img
        className={"h-full object-scale-down"}
        src={getCurrentPageUrl()}
        alt=""
      />

      <button
        className="absolute right-0 h-full w-1/2 bg-blue-400/20"
        onClick={prevPage}
      ></button>

      {isLastPage && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-700/95 p-10 text-xl">
          Last page
        </div>
      )}
    </div>
  );
};

export default ViewPage;

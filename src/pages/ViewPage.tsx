import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useChapter, useNextChapter } from "../api/manga";
import { pb } from "../api/pocketbase";

const ViewPage = () => {
  const { id } = useParams();
  console.log("ID", id);

  const navigate = useNavigate();

  const chapterQuery = useChapter({ id });
  const nextChapterQuery = useNextChapter({ id });

  const [currentPage, setCurrentPage] = useState(0);
  const [isLastPage, setLastPage] = useState(false);

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

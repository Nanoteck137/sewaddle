import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useChapter, useNextChapter } from "../api/manga";
import { pb } from "../api/pocketbase";

const ViewPage = () => {
  const { id } = useParams();

  const chapterQuery = useChapter({ id });
  const nextChapterQuery = useNextChapter({ id });

  const [currentPage, setCurrentPage] = useState(0);

  if (chapterQuery.isError) return <p className="dark:text-white">Error</p>;
  if (chapterQuery.isLoading)
    return <p className="dark:text-white">Loading...</p>;

  const { data } = chapterQuery;
  const { data: nextChapter } = nextChapterQuery;

  const nextPage = () => {
    // TODO(patrik): Check for overflow
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    // TODO(patrik): Check for underflow
    setCurrentPage(currentPage - 1);
  };

  const getCurrentPageUrl = () => {
    return pb.getFileUrl(data, data.pages[currentPage]);
  };

  return (
    <div className="relative flex h-full w-full justify-center">
      <button
        className="absolute bg-red-400/20 h-full w-1/2 left-0"
        onClick={nextPage}
      ></button>

      <img
        className={"h-full object-scale-down"}
        src={getCurrentPageUrl()}
        alt=""
      />

      <button
        className="absolute bg-blue-400/20 h-full w-1/2 right-0"
        onClick={prevPage}
      ></button>

      {/* {nextChapter && (
        <Link className="dark:text-white" to={`/view/${nextChapter.next}`}>
          Next Chapter
        </Link>
      )} */}
    </div>
  );
};

export default ViewPage;

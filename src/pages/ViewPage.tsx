import { Link, useParams } from "react-router-dom";

import { useChapter, useNextChapter } from "../api/manga";
import { pb } from "../api/pocketbase";

const ViewPage = () => {
  const { id } = useParams();

  const chapterQuery = useChapter({ id });
  const nextChapterQuery = useNextChapter({ id });

  if (chapterQuery.isError) return <p className="dark:text-white">Error</p>;
  if (chapterQuery.isLoading)
    return <p className="dark:text-white">Loading...</p>;

  const { data } = chapterQuery;
  const { data: nextChapter } = nextChapterQuery;

  return (
    <div className="flex flex-col gap-2 items-center">
      {data.pages.map((page, i) => {
        return (
          <img
            className={`w-auto h-auto max-h-[100vh]`}
            src={pb.getFileUrl(data, page)}
            alt=""
            key={i}
          />
        );
      })}

      {nextChapter && (
        <Link to={`/view/${nextChapter.next}`}>Next Chapter</Link>
      )}
    </div>
  );
};

export default ViewPage;

import { HomeIcon, StarIcon } from "@heroicons/react/24/solid";
import { useLocation } from "react-router-dom";

import { BigThemeControl, SmallThemeControl } from "./ThemeControls";

export const BigSidebarButtons = () => {
  const location = useLocation();

  const isHome = location.pathname == "/";
  const isSaved = false;

  return (
    <div className="flex flex-col gap-4 p-2">
      <button
        className={`flex items-center rounded border-b-2 border-gray-100 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 ${
          isHome ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        <HomeIcon className="h-9 w-9" />
        <div className="w-5" />
        <p className="text-base">Home</p>
      </button>
      <button
        className={`flex items-center rounded border-b-2 border-gray-100 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 ${
          isSaved ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        <StarIcon className="h-9 w-9" />
        <div className="w-5" />
        <p className="text-base">Saved</p>
      </button>
      <BigThemeControl />
    </div>
  );
};

export const SmallSidebarButtons = () => {
  const location = useLocation();

  const isHome = location.pathname == "/";
  const isSaved = false;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <button
        className={`flex h-20 w-20 flex-col items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
          isHome ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        <HomeIcon className="h-8 w-8" />
        <p className="text-xs">Home</p>
      </button>

      <button
        className={`flex h-20 w-20 flex-col items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
          isSaved ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        <StarIcon className="h-8 w-8" />
        <p className="text-xs">Saved</p>
      </button>

      <SmallThemeControl />
    </div>
  );
};

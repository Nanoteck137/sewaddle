import { HomeIcon, StarIcon } from "@heroicons/react/24/solid";

import { BigThemeControl, SmallThemeControl } from "./ThemeControls";

export const BigSidebarButtons = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
        <HomeIcon className="h-9 w-9" />
        <div className="w-5" />
        <p className="text-base">Home</p>
      </button>
      <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
        <StarIcon className="h-9 w-9" />
        <div className="w-5" />
        <p className="text-base">Saved</p>
      </button>
      <BigThemeControl />
    </div>
  );
};

export const SmallSidebarButtons = () => {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <button className="flex flex-col items-center">
        <HomeIcon className="h-8 w-8" />
        <p className="text-xs">Home</p>
      </button>

      <button className="flex flex-col items-center">
        <StarIcon className="h-8 w-8" />
        <p className="text-xs">Saved</p>
      </button>

      <SmallThemeControl />
    </div>
  );
};

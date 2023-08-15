import { Popover, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  HomeIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  Component,
  ComponentProps,
  ComponentType,
  forwardRef,
  ReactElement,
  ReactNode,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { Button } from "./sidebar/Button";
import ThemeSelector from "./sidebar/ThemeSelector";
import { BigThemeControl, SmallThemeControl } from "./ThemeControls";

export const BigSidebarButtons = () => {
  const location = useLocation();

  const isHome = location.pathname == "/";
  const isAccount = false;
  const isSaved = false;

  const Button = (props: {
    title: string;
    icon: ReactNode;
    selected?: boolean;
  }) => {
    const { title, icon, selected } = props;
    return (
      <button
        className={`flex items-center rounded border-b-2 border-gray-100 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 ${
          selected ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        {icon}
        <div className="w-5" />
        <p className="text-base">{title}</p>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col justify-between p-2">
      <div className="flex flex-col gap-4">
        <Button
          title="Home"
          icon={<HomeIcon className="h-9 w-9" />}
          selected={isHome}
        />

        <Button
          title="Account"
          icon={<UserIcon className="h-9 w-9" />}
          selected={isAccount}
        />

        <Button
          title="Saved"
          icon={<StarIcon className="h-9 w-9" />}
          selected={isSaved}
        />
      </div>

      <div>
        <SmallThemeControl />
      </div>
    </div>
  );
};

export const SmallSidebarButtons = () => {
  const location = useLocation();

  const isHome = location.pathname == "/";
  const isAccount = false;
  const isSaved = false;

  const Button = (props: {
    title: string;
    icon: ReactNode;
    selected?: boolean;
  }) => {
    const { title, icon, selected } = props;
    return (
      <button
        className={`flex h-20 w-20 flex-col items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
          selected ? "bg-gray-100 dark:bg-gray-600" : ""
        }`}
      >
        {icon}
        <p className="text-xs">{title}</p>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col items-center justify-between py-2">
      <div className="flex flex-col gap-4">
        <Button
          title="Home"
          icon={<HomeIcon className="h-8 w-8" />}
          selected={isHome}
        />

        <Button
          title="Account"
          icon={<UserIcon className="h-8 w-8" />}
          selected={isAccount}
        />

        <Button
          title="Saved"
          icon={<StarIcon className="h-8 w-8" />}
          selected={isSaved}
        />
      </div>

      <div>
        <SmallThemeControl />
      </div>
    </div>
  );
};

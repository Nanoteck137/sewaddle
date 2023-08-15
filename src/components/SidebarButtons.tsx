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

import {
  BigThemeControl,
  SmallThemeControl,
  TestThemeControl,
} from "./ThemeControls";

type ButtonProps = {
  title: string;
  icon: ComponentType;
  selected?: boolean;
} & ComponentProps<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { title, icon: Icon, selected, className, ...buttonProps } = props;

    return (
      <button
        ref={ref}
        className={twMerge(
          `flex items-center rounded border-b-2 border-gray-100 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 lg:max-xl:flex-col lg:max-xl:border-none lg:max-xl:shadow-none ${
            selected ? "bg-gray-100 dark:bg-gray-600" : ""
          }`,
          className,
        )}
        {...buttonProps}
      >
        <div className="flex h-9 w-9 items-center justify-center lg:max-xl:h-8 lg:max-xl:w-8">
          <Icon />
        </div>
        <div className="w-5" />
        <p className="text-base">{title}</p>
      </button>
    );
  },
);

const Buttons = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-2">
      <div className="flex w-full flex-col gap-2">
        <Button title="Test" icon={HomeIcon} />
        <Button title="Test" icon={HomeIcon} />
        <Button title="Test" icon={HomeIcon} />
      </div>
      <div className="flex w-full flex-col">
        {/* <Button title="Test" icon={HomeIcon} /> */}
        <TestThemeControl />
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-24 border-r-2 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700 lg:block xl:w-60">
      <Buttons />
    </div>
  );
};

export const FloatingSidebar = () => {
  return (
    <Popover className="lg:hidden">
      {({ open, close }) => (
        <>
          <Popover.Button className="flex items-center">
            <Bars3Icon className="h-10 w-10" />
          </Popover.Button>

          <Transition
            className="fixed bottom-0 left-0 right-0 top-0"
            show={open}
            as="div"
          >
            <Transition.Child
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Popover.Overlay
                className="fixed bottom-0 left-0 right-0 top-0 cursor-pointer bg-black/60"
                as="div"
              ></Popover.Overlay>
            </Transition.Child>

            <Transition.Child
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Popover.Panel
                className="fixed z-50 h-screen w-60 bg-white pb-16 dark:bg-gray-700"
                static
              >
                <div className="flex h-16 items-center gap-4 border-b-2 px-7 dark:border-gray-600">
                  <button onClick={close}>
                    <Bars3Icon className="h-10 w-10" />
                  </button>
                  <Link to="/" className="text-2xl" onClick={close}>
                    Sewaddle
                  </Link>
                </div>

                <Buttons />
              </Popover.Panel>
            </Transition.Child>
          </Transition>
        </>
      )}
    </Popover>
  );
};

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

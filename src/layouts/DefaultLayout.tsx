import { Popover, Transition } from "@headlessui/react";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Link, Outlet } from "react-router-dom";

import {
  BigSidebarButtons,
  SmallSidebarButtons,
} from "../components/SidebarButtons";

const Header = () => {
  return (
    <div className="fixed left-0 right-0 z-50 h-16 border-b-2 bg-white px-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4 px-3">
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
                      className="fixed z-50 h-screen w-60 bg-white dark:bg-gray-700"
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

                      <BigSidebarButtons />
                    </Popover.Panel>
                  </Transition.Child>
                </Transition>
              </>
            )}
          </Popover>
          <Link to="/" className="text-2xl">
            Sewaddle
          </Link>
        </div>

        <button>
          <MagnifyingGlassIcon className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

const BigSidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-60 bg-white shadow-lg dark:bg-gray-700 xl:block">
      <BigSidebarButtons />
    </div>
  );
};

const SmallSidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-24 border-r-2 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700 lg:block xl:hidden">
      <SmallSidebarButtons />
    </div>
  );
};

const DefaultLayout = () => {
  return (
    <div className="flex h-screen">
      <Header />
      <BigSidebar />
      <SmallSidebar />

      <div className="z-40 mt-16 flex-grow lg:ml-24 xl:ml-60">
        <Outlet />
      </div>
    </div>
  );
};

export default DefaultLayout;

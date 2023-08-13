import { Listbox } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { Link, Outlet } from "react-router-dom";
import { useTernaryDarkMode } from "usehooks-ts";

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

const ThemeControl = () => {
  const { setTernaryDarkMode, ternaryDarkMode } = useTernaryDarkMode();

  return (
    <Listbox value={ternaryDarkMode} onChange={setTernaryDarkMode} as="div">
      <Listbox.Button className="flex w-full items-center justify-between rounded bg-gray-500 px-4">
        <p>Theme: {capitalizeFirstLetter(ternaryDarkMode)}</p>
        <ChevronRightIcon className="h-5 w-5 ui-open:hidden" />
        <ChevronDownIcon className="hidden h-5 w-5 ui-open:block" />
      </Listbox.Button>
      <Listbox.Options>
        <Listbox.Option className="cursor-pointer bg-gray-400" value={"dark"}>
          Dark
        </Listbox.Option>
        <Listbox.Option value={"light"}>Light</Listbox.Option>
        <Listbox.Option value={"system"}>System</Listbox.Option>
      </Listbox.Options>
    </Listbox>
  );
};

const DefaultLayout = () => {
  const { isDarkMode } = useTernaryDarkMode();

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="fixed h-screen w-full bg-white dark:bg-slate-800"></div>
      <div className="flex h-screen">
        <div className="fixed left-0 right-0 z-50 h-16 border-b-2 bg-white px-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
          <div className="flex h-full items-center justify-between">
            <button>
              <Bars3Icon className="h-10 w-10 dark:text-white" />
            </button>
            <div>
              <Link to="/" className="text-2xl dark:text-white">
                Sewaddle
              </Link>
            </div>
            <div></div>
          </div>
        </div>
        <div className="fixed bottom-0 top-16 z-50 hidden w-60 bg-white shadow-lg dark:bg-gray-700 xl:block">
          <div className="flex h-full flex-col overflow-auto px-2">
            <ThemeControl />
          </div>
        </div>
        <div className="fixed bottom-0 top-16 z-50 hidden w-24 bg-red-200 shadow-lg dark:bg-gray-700 lg:block xl:hidden">
          {/* <div className="flex h-full flex-col overflow-auto px-2"></div> */}
        </div>
        <div className="z-40 mt-16 flex-grow lg:ml-24 xl:ml-60">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;

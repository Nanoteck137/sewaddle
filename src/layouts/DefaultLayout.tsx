import { Listbox, Popover } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  StarIcon,
  SunIcon,
} from "@heroicons/react/24/solid";
import { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { useTernaryDarkMode } from "usehooks-ts";

const ThemeControl = () => {
  const { setTernaryDarkMode, ternaryDarkMode } = useTernaryDarkMode();

  return (
    <Listbox
      className="relative"
      value={ternaryDarkMode}
      onChange={setTernaryDarkMode}
      as="div"
    >
      <Listbox.Button className="flex w-full items-center justify-between rounded border-b-2 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
        <div className="flex items-center">
          <MoonIcon className="h-9 w-9" />
          <div className="w-5" />
          <p>Theme</p>
        </div>
        <ChevronRightIcon className="h-8 w-8 ui-open:hidden" />
        <ChevronDownIcon className="h-8 w-8 ui-not-open:hidden" />
      </Listbox.Button>
      <Listbox.Options className="absolute left-0 right-0 top-12 overflow-hidden rounded border-2 shadow dark:border-gray-500">
        <Option
          value="dark"
          name="Dark"
          icon={<MoonIcon className="h-5 w-5" />}
        />
        <Option
          value="light"
          name="Light"
          icon={<SunIcon className="h-5 w-5" />}
        />
        <Option
          value="system"
          name="System"
          icon={<GlobeAltIcon className="h-5 w-5" />}
        />
      </Listbox.Options>
    </Listbox>
  );
};

const Option = (props: { value: string; name: string; icon: ReactNode }) => {
  const { value, name, icon } = props;

  const { ternaryDarkMode } = useTernaryDarkMode();

  return (
    <Listbox.Option
      className={`flex cursor-pointer items-center gap-2  px-10 py-2 hover:bg-gray-200  dark:text-white dark:hover:bg-gray-500 ${
        value == ternaryDarkMode
          ? "bg-gray-200 dark:bg-gray-500"
          : "bg-white dark:bg-gray-600 "
      }`}
      value={value}
    >
      {icon}
      <p>{name}</p>
    </Listbox.Option>
  );
};

const SmallThemeControl = () => {
  const { isDarkMode, setTernaryDarkMode, ternaryDarkMode } =
    useTernaryDarkMode();

  const Icon = () => {
    if (isDarkMode) {
      return <MoonIcon className="h-8 w-8" />;
    } else {
      return <SunIcon className="h-8 w-8" />;
    }
  };

  return (
    <Listbox
      value={ternaryDarkMode}
      onChange={setTernaryDarkMode}
      as="div"
      className="relative flex w-full justify-center"
    >
      <Listbox.Button className="flex flex-col items-center dark:text-white">
        <Icon />
        <p className="text-sm">Theme</p>
      </Listbox.Button>
      <Listbox.Options className="absolute -top-2 left-24 overflow-hidden rounded border-2 dark:border-gray-500">
        <Option
          value="dark"
          name="Dark"
          icon={<MoonIcon className="h-5 w-5" />}
        />
        <Option
          value="light"
          name="Light"
          icon={<SunIcon className="h-5 w-5" />}
        />
        <Option
          value="system"
          name="System"
          icon={<GlobeAltIcon className="h-5 w-5" />}
        />
      </Listbox.Options>
    </Listbox>
  );
};

const Header = () => {
  return (
    <div className="fixed left-0 right-0 z-50 h-16 border-b-2 bg-white px-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4 px-3">
          <Popover className="relative lg:hidden">
            {({ open, close }) => (
              <>
                <Popover.Button className="flex items-center">
                  <Bars3Icon className="h-10 w-10 dark:text-white" />
                </Popover.Button>
                {open && (
                  <>
                    <div className="fixed left-0 top-0 h-screen w-full bg-red-800/60 bg-white"></div>
                    <Popover.Panel
                      className="fixed bottom-0 left-0 top-0 h-full w-60 bg-white dark:bg-gray-700 dark:text-white"
                      static
                    >
                      <div className="flex h-16 items-center gap-4 border-b-2 px-7 dark:border-gray-600 dark:text-white">
                        <button onClick={close}>
                          <Bars3Icon className="h-10 w-10" />
                        </button>
                        <Link to="/" className="text-2xl">
                          Sewaddle
                        </Link>
                      </div>
                      <div className="flex flex-col gap-2 px-2 py-2">
                        <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
                          <HomeIcon className="h-9 w-9 dark:text-white" />
                          <div className="w-5" />
                          <p className="text-base dark:text-white">Home</p>
                        </button>
                        <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
                          <StarIcon className="h-9 w-9 dark:text-white" />
                          <div className="w-5" />
                          <p className="text-base dark:text-white">Saved</p>
                        </button>
                        <ThemeControl />
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </>
            )}
          </Popover>
          <Link to="/" className="text-2xl dark:text-white">
            Sewaddle
          </Link>
        </div>

        <button>
          <MagnifyingGlassIcon className="h-8 w-8 dark:text-white" />
        </button>
      </div>
    </div>
  );
};

const BigSidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-60 bg-white shadow-lg dark:bg-gray-700 xl:block">
      <div className="flex flex-col gap-2 p-2">
        <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
          <HomeIcon className="h-9 w-9 dark:text-white" />
          <div className="w-5" />
          <p className="text-base dark:text-white">Home</p>
        </button>
        <button className="flex items-center rounded border-b-2 border-gray-100 px-2 py-1 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
          <StarIcon className="h-9 w-9 dark:text-white" />
          <div className="w-5" />
          <p className="text-base dark:text-white">Saved</p>
        </button>
        <ThemeControl />
      </div>
    </div>
  );
};

const SmallSidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-24 border-r-2 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700 lg:block xl:hidden">
      <div className="flex flex-col items-center gap-6 py-4">
        <button className="flex flex-col items-center">
          <HomeIcon className="h-8 w-8 dark:text-white" />
          <p className="text-xs dark:text-white">Home</p>
        </button>

        <button className="flex flex-col items-center">
          <StarIcon className="h-8 w-8 dark:text-white" />
          <p className="text-xs dark:text-white">Saved</p>
        </button>

        <SmallThemeControl />
      </div>
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

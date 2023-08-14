import { Listbox } from "@headlessui/react";
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
import { Link, Outlet, useLocation } from "react-router-dom";
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

  const Option = (props: { value: string; name: string; icon: ReactNode }) => {
    const { value, name, icon } = props;
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

  return (
    <Listbox
      value={ternaryDarkMode}
      onChange={setTernaryDarkMode}
      as="div"
      className="relative flex w-full justify-center"
    >
      <Listbox.Button className="flex flex-col items-center dark:text-white">
        <Icon />
        <p className="text-sm ">Theme</p>
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
        <div className="flex h-full items-center gap-8">
          <button>
            <Bars3Icon className="h-10 w-10 dark:text-white" />
          </button>
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
      <div className="flex h-full flex-col overflow-auto px-2">
        <ThemeControl />
      </div>
    </div>
  );
};

const SmallSidebar = () => {
  return (
    <div className="fixed bottom-0 top-16 z-50 hidden w-24 border-r-2 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700 lg:block xl:hidden">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <HomeIcon className="h-8 w-8 dark:text-white" />
          <p className="text-xs dark:text-white">Home</p>
        </div>
        <div className="flex flex-col items-center">
          <StarIcon className="h-8 w-8 dark:text-white" />
          <p className="text-xs dark:text-white">Saved</p>
        </div>
        <SmallThemeControl />
        {/* <div className="flex flex-col items-center">
          <SunIcon className="h-8 w-8 dark:text-white" />
          <p className="text-xs dark:text-white">Theme</p>
        </div> */}
      </div>
    </div>
  );
};

const DefaultLayout = () => {
  const { isDarkMode } = useTernaryDarkMode();

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="fixed h-screen w-full bg-white dark:bg-slate-800"></div>

      <div className="flex h-screen">
        <Header />
        <BigSidebar />
        <SmallSidebar />

        <div className="z-40 mt-16 flex-grow lg:ml-24 xl:ml-60">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;

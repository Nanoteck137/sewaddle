import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/solid";
import { ReactNode } from "react";
import { useTernaryDarkMode } from "usehooks-ts";

const Option = (props: { value: string; name: string; icon: ReactNode }) => {
  const { value, name, icon } = props;

  const { ternaryDarkMode } = useTernaryDarkMode();

  return (
    <Listbox.Option
      className={`flex cursor-pointer items-center gap-2  px-10 py-2 hover:bg-gray-200 dark:hover:bg-gray-500 ${
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

export const BigThemeControl = () => {
  const { isDarkMode, setTernaryDarkMode, ternaryDarkMode } =
    useTernaryDarkMode();

  const Icon = () => {
    if (isDarkMode) {
      return <MoonIcon className="h-9 w-9" />;
    } else {
      return <SunIcon className="h-9 w-9" />;
    }
  };

  return (
    <Listbox
      className="relative"
      value={ternaryDarkMode}
      onChange={setTernaryDarkMode}
      as="div"
    >
      {({ open }) => (
        <>
          <Listbox.Button className="flex w-full items-center justify-between rounded border-b-2 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
            <div className="flex items-center">
              <Icon />
              <div className="w-5" />
              <p>Theme</p>
            </div>
            <ChevronRightIcon
              className={`h-8 w-8 ${open ? "rotate-90" : ""}`}
            />
          </Listbox.Button>
          <Listbox.Options className="absolute left-0 right-0 top-14 overflow-hidden rounded border-2 shadow dark:border-gray-500">
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
        </>
      )}
    </Listbox>
  );
};

export const TestThemeControl = () => {
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
      {({ open }) => (
        <>
          <Listbox.Button className="flex w-full items-center justify-between rounded border-b-2 p-2 shadow-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">
            <div className="flex items-center">
              <Icon />
              <div className="w-5" />
              <p>Theme</p>
            </div>
            <ChevronUpIcon
              className={`h-8 w-8 transition-transform duration-100 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Listbox.Button>

          <Listbox.Options className="absolute -top-32 left-0 right-0 z-50 overflow-hidden rounded border-2 dark:border-gray-500">
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
        </>
      )}
    </Listbox>
  );
};

export const SmallThemeControl = () => {
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
      <Listbox.Button className="flex h-20 w-20 flex-col items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600">
        <Icon />
        <p className="text-sm">Theme</p>
      </Listbox.Button>
      <Listbox.Options className="absolute bottom-[calc(100%+0.5rem)] left-0 overflow-hidden rounded border-2 dark:border-gray-500">
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

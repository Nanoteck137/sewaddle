import { Listbox } from "@headlessui/react";
import { GlobeAltIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";
import { useTernaryDarkMode } from "usehooks-ts";

import { Button } from "./Button";

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

const ThemeSelector = () => {
  const { isDarkMode, setTernaryDarkMode, ternaryDarkMode } =
    useTernaryDarkMode();

  const Icon = () => {
    if (isDarkMode) {
      return <MoonIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />;
    } else {
      return <SunIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />;
    }
  };

  return (
    <Listbox
      value={ternaryDarkMode}
      onChange={setTernaryDarkMode}
      as="div"
      className="relative flex w-full items-center justify-center"
    >
        <>
          <Listbox.Button
            className="w-full"
            title="Theme"
            icon={<Icon />}
            as={Button}
          ></Listbox.Button>

          <Listbox.Options className="absolute -top-32 left-0 right-0 z-50 overflow-hidden rounded border-2 dark:border-gray-500 lg:max-xl:right-auto">
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
    </Listbox>
  );
};

export default ThemeSelector;

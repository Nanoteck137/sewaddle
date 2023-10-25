import { Popover, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  HomeIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
// import { useAuth } from "../../hooks/useAuth";
import { Button } from "./Button";
import ThemeSelector from "./ThemeSelector";

const Buttons = (props: { close?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuth();

  const isHome = location.pathname === "/";
  const isAccount = location.pathname === "/account";
  const isSaved = location.pathname === "/account/saved";

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-2">
      <div className="flex w-full flex-col gap-2">
        <Button
          title="Home"
          icon={<HomeIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />}
          selected={isHome}
          onClick={() => {
            navigate("/");
            props.close?.();
          }}
        />
        <Button
          title="Saved"
          icon={<StarIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />}
          selected={isSaved}
          onClick={() => {
            navigate("/saved");
            props.close?.();
          }}
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        {auth.isLoggedIn && (
          <>
            <Button
              title="Account"
              icon={
                <UserIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />
              }
              selected={isAccount}
              onClick={() => {
                navigate("/account");
                props.close?.();
              }}
            />
            <ThemeSelector />
            <Button
              title="Logout"
              icon={
                <ArrowLeftOnRectangleIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />
              }
              onClick={() => {
                auth.logout();
                props.close?.();
                navigate("/");
              }}
            />
          </>
        )}
        {!auth.isLoggedIn && (
          <Button
            title="Login"
            icon={
              <ArrowRightOnRectangleIcon className="h-9 w-9 lg:max-xl:h-8 lg:max-xl:w-8" />
            }
            onClick={() => {
              navigate("/login");
              props.close?.();
            }}
          />
        )}
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

                <Buttons close={close} />
              </Popover.Panel>
            </Transition.Child>
          </Transition>
        </>
      )}
    </Popover>
  );
};

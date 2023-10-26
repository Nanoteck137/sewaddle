import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { Link, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ComputerDesktopIcon,
  MoonIcon,
  StarIcon,
  SunIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTernaryDarkMode } from "usehooks-ts";
import { FloatingSidebar, Sidebar } from "../components/sidebar/Sidebar";

const Header = () => {
  return (
    <div className="fixed left-0 right-0 z-50 h-16 border-b-2 bg-white px-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4 px-3">
          <FloatingSidebar />

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

const AccountDropdown = () => {
  const auth = useAuth();

  const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode();
  const [menuOpen, setMenuOpen] = useState<"none" | "menu" | "theme">("none");

  return (
    <div className="relative flex items-center">
      <button onClick={() => setMenuOpen("menu")}>
        <UserIcon className="h-8 w-8" />
      </button>

      {menuOpen === "menu" && (
        <>
          <div className="fixed inset-0" onClick={() => setMenuOpen("none")} />
          <div className="absolute right-0 top-10 flex w-72 flex-col overflow-hidden rounded border bg-white shadow-lg dark:border-gray-500 dark:bg-gray-700">
            <div className="flex flex-col py-2">
              <Link
                to="/account"
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setMenuOpen("none")}
              >
                <UserCircleIcon className="h-6 w-6" />
                <span>{auth.user?.username}</span>
              </Link>
            </div>

            <div className="h-[1px] bg-gray-500"></div>

            <div className="flex flex-col py-2">
              <Link
                to="/saved"
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setMenuOpen("none")}
              >
                <StarIcon className="h-6 w-6" />
                <span>Saved Mangas</span>
              </Link>
              <button
                className="flex justify-between p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setMenuOpen("theme");
                }}
              >
                <div className="flex gap-2">
                  <MoonIcon className="h-6 w-6" />
                  <span>
                    Theme:{" "}
                    {ternaryDarkMode.charAt(0).toUpperCase() +
                      ternaryDarkMode.slice(1)}
                  </span>
                </div>
                <ChevronRightIcon className="h-6 w-6" />
              </button>
              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => {
                  auth.logout();
                  setMenuOpen("none");
                }}
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
      {menuOpen === "theme" && (
        <>
          <div className="fixed inset-0" onClick={() => setMenuOpen("none")} />
          <div className="absolute right-0 top-10 flex w-72 flex-col overflow-hidden rounded border bg-white shadow-lg dark:border-gray-500 dark:bg-gray-700">
            <div className="flex flex-col py-2">
              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setMenuOpen("menu");
                }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
                <span>Back</span>
              </button>
            </div>

            <div className="h-[1px] bg-gray-500"></div>

            <div className="flex flex-col py-2">
              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("system")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "system" ? "opacity-0" : ""
                  }`}
                />
                <ComputerDesktopIcon className="h-6 w-6" />
                <span>System Default</span>
              </button>

              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("light")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "light" ? "opacity-0" : ""
                  }`}
                />
                <SunIcon className="h-6 w-6" />
                <span>Light Mode</span>
              </button>

              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("dark")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "dark" ? "opacity-0" : ""
                  }`}
                />
                <MoonIcon className="h-6 w-6" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NormalDropdown = () => {
  const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode();
  const [menuOpen, setMenuOpen] = useState<"none" | "menu" | "theme">("none");

  return (
    <div className="relative flex items-center">
      <button onClick={() => setMenuOpen("menu")}>
        <EllipsisVerticalIcon className="h-8 w-8" />
      </button>

      {menuOpen === "menu" && (
        <>
          <div className="fixed inset-0" onClick={() => setMenuOpen("none")} />
          <div className="absolute right-0 top-10 flex w-72 flex-col overflow-hidden rounded border bg-white shadow-lg dark:border-gray-500 dark:bg-gray-700">
            {/* <div className="flex flex-col py-2">
              <Link
                to="/account"
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setMenuOpen("none")}
              >
                <UserCircleIcon className="h-6 w-6" />
                <span>Nanoteck137</span>
              </Link>
            </div>

            <div className="h-[1px] bg-gray-500"></div> */}

            <div className="flex flex-col py-2">
              <button
                className="flex justify-between p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setMenuOpen("theme");
                }}
              >
                <div className="flex gap-2">
                  <MoonIcon className="h-6 w-6" />
                  <span>
                    Theme:{" "}
                    {ternaryDarkMode.charAt(0).toUpperCase() +
                      ternaryDarkMode.slice(1)}
                  </span>
                </div>
                <ChevronRightIcon className="h-6 w-6" />
              </button>
              <Link
                to="/login"
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </>
      )}
      {menuOpen === "theme" && (
        <>
          <div className="fixed inset-0" onClick={() => setMenuOpen("none")} />
          <div className="absolute right-0 top-10 flex w-72 flex-col overflow-hidden rounded border bg-white shadow-lg dark:border-gray-500 dark:bg-gray-700">
            <div className="flex flex-col py-2">
              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => {
                  setMenuOpen("menu");
                }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
                <span>Back</span>
              </button>
            </div>

            <div className="h-[1px] bg-gray-500"></div>

            <div className="flex flex-col py-2">
              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("system")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "system" ? "opacity-0" : ""
                  }`}
                />
                <ComputerDesktopIcon className="h-6 w-6" />
                <span>System Default</span>
              </button>

              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("light")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "light" ? "opacity-0" : ""
                  }`}
                />
                <SunIcon className="h-6 w-6" />
                <span>Light Mode</span>
              </button>

              <button
                className="flex gap-2 p-2 hover:bg-slate-200 dark:hover:bg-gray-600"
                onClick={() => setTernaryDarkMode("dark")}
              >
                <CheckIcon
                  className={`h-6 w-6 ${
                    ternaryDarkMode !== "dark" ? "opacity-0" : ""
                  }`}
                />
                <MoonIcon className="h-6 w-6" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NewHeader = () => {
  const auth = useAuth();

  return (
    <div className="fixed left-0 right-0 z-50 h-16 border-b-2 bg-white px-4 shadow-lg dark:border-gray-600 dark:bg-gray-700">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full items-center gap-4 px-3">
          <Link to="/" className="text-2xl">
            Sewaddle
          </Link>
        </div>

        <div className="flex gap-6">
          <button>
            <MagnifyingGlassIcon className="h-8 w-8" />
          </button>
          {auth.user ? <AccountDropdown /> : <NormalDropdown />}
        </div>
      </div>
    </div>
  );
};

const DefaultLayout = () => {
  return (
    <div className="flex h-screen">
      <Header />
      <Sidebar />

      <div className="z-40 mt-16 flex-grow lg:ml-24 xl:ml-60">
        <Outlet />
      </div>
    </div>
  );
};

const NewDefaultLayout = () => {
  return (
    <div className="flex h-screen">
      <NewHeader />

      <div className="z-40 mt-16 flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default NewDefaultLayout;

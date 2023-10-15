import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Link, Outlet } from "react-router-dom";

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

export default DefaultLayout;

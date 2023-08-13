import { Outlet } from "react-router-dom";
import { useTernaryDarkMode } from "usehooks-ts";

const BlankLayout = () => {
  const { isDarkMode } = useTernaryDarkMode();

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="fixed h-screen w-full bg-white dark:bg-slate-800"></div>

      <div className="flex h-screen">
        <div className="z-40 flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BlankLayout;

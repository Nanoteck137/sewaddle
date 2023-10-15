import { Outlet } from "react-router-dom";

const BlankLayout = () => {
  return (
    <div className="flex h-screen">
      <div className="z-40 flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default BlankLayout;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PocketBase from "pocketbase";

import DefaultLayout from "./layouts/DefaultLayout";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SeriesPage from "./pages/SeriesPage";

const queryClient = new QueryClient();
export const pb = new PocketBase("http://10.28.28.5:8090");

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DefaultLayout />}>
              <Route index element={<HomePage />} />
              <Route path="series/:id" element={<SeriesPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
};

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PocketBase from "pocketbase";

import BlankLayout from "./layouts/BlankLayout";
import DefaultLayout from "./layouts/DefaultLayout";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SeriesPage from "./pages/SeriesPage";

const queryClient = new QueryClient();
export const pb = new PocketBase("http://10.28.28.5:8090");

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route element={<DefaultLayout />}>
                <Route index element={<HomePage />} />
                <Route path="series/:id" element={<SeriesPage />} />

                <Route path="account" element={<AccountPage />} />
                <Route path="about" element={<AboutPage />} />
              </Route>

              <Route element={<BlankLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
};

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useTernaryDarkMode } from "usehooks-ts";

import { AuthProvider } from "./contexts/AuthContext";
import BlankLayout from "./layouts/BlankLayout";
import DefaultLayout from "./layouts/DefaultLayout";
import AccountPage from "./pages/AccountPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SavedPage from "./pages/SavedPage";
import SeriesPage from "./pages/SeriesPage";
import ViewPage from "./pages/ViewPage";

const queryClient = new QueryClient();

const App = () => {
  const { isDarkMode } = useTernaryDarkMode();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/">
                <Route element={<DefaultLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="series/:id" element={<SeriesPage />} />
                  <Route path="view/:id" element={<ViewPage />} />

                  <Route path="account" element={<AccountPage />} />
                  <Route path="saved" element={<SavedPage />} />
                </Route>

                <Route element={<BlankLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;

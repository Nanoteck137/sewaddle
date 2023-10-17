import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
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
import { trpc } from "./trpc";

const queryClient = new QueryClient();

export const apiEndpoint = "http://localhost:3000";
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${apiEndpoint}/trpc`,
    }),
  ],
});

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
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/">
                  <Route element={<DefaultLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="series/:id" element={<SeriesPage />} />
                    <Route
                      path="view/:mangaId/:chapterIndex"
                      element={<ViewPage />}
                    />

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
      </trpc.Provider>
    </>
  );
};

export default App;

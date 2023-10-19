import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { RouterOutput, trpc } from "@/trpc";

type AuthContext = {
  isLoggedIn: boolean;
  user?: User;

  register: (data: {
    username: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;

  login: (data: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContext>({
  isLoggedIn: false,

  register: async () => {},
  login: async () => {},
  logout: () => {},
  changePassword: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

type AuthProviderProps = {
  children?: ReactNode;
};

type User = RouterOutput["auth"]["getProfile"];

export const AuthProvider = (props: AuthProviderProps) => {
  const [token, setToken] = useState(localStorage.getItem("loginToken"));

  const profile = trpc.auth.getProfile.useQuery(undefined, {
    enabled: !!token,
  });

  const authLogin = trpc.auth.login.useMutation({
    onSuccess: async (obj) => {
      localStorage.setItem("loginToken", obj.token);
      setToken(obj.token);
    },
  });

  const authRegister = trpc.auth.register.useMutation();

  const authChangePassword = trpc.auth.changePassword.useMutation();

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      passwordConfirm: string;
    }) => {
      await authRegister.mutateAsync(data);
      await login({ username: data.username, password: data.password });
    },
    [],
  );

  const login = useCallback(
    async (data: { username: string; password: string }) => {
      await authLogin.mutateAsync(data);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("loginToken");
    profile.remove();
    setToken(null);
  }, []);

  const changePassword = useCallback(
    async (data: {
      oldPassword: string;
      newPassword: string;
      newPasswordConfirm: string;
    }) => {
      await authChangePassword.mutateAsync(data);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        user: profile.data,
        register,
        login,
        logout,
        changePassword,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

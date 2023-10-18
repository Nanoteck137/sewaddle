import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { RouterOutput, trpc } from "@/trpc";
// import { User } from "../api/models/users";
import { pb } from "../api/pocketbase";

type AuthContext = {
  isLoggedIn: boolean;
  user?: User;

  register: (data: {
    username: string;
    newPassword: string;
    passwordConfirm: string;
  }) => Promise<void>;

  login: (data: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  changePassword: (data: {
    oldPassword: string;
    password: string;
    passwordConfirm: string;
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

  const register = useCallback(
    async (data: {
      username: string;
      newPassword: string;
      passwordConfirm: string;
    }) => {
      await pb.collection("users").create({
        username: data.username,
        password: data.newPassword,
        passwordConfirm: data.passwordConfirm,
      });
      await login({ username: data.username, password: data.newPassword });
    },
    [],
  );

  const login = useCallback(
    async (data: { username: string; password: string }) => {
      authLogin.mutate(data);
      // await pb
      //   .collection("users")
      //   .authWithPassword(data.username, data.password);
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
      password: string;
      passwordConfirm: string;
    }) => {
      if (profile.data) {
        // await pb.collection("users").update(user.id, data);
        // logout();
      }
    },
    [profile.data],
  );

  // useEffect(() => {
  //   const token = localStorage.getItem("loginToken");
  // }, []);

  // useEffect(() => {
  //   const updateUser = (model: Record | Admin | null) => {
  //     if (model && model instanceof Record) {
  //       const user = User.parse(model);
  //       setUser(user);
  //       setLoggedIn(true);
  //     } else {
  //       setUser(undefined);
  //       setLoggedIn(false);
  //     }
  //   };

  //   if (pb.authStore.isValid) {
  //     updateUser(pb.authStore.model);
  //   }

  //   const unsub = pb.authStore.onChange((token, model) => {
  //     console.log("onChange", model);
  //     console.log("onChange", token);
  //     updateUser(model);
  //   });

  //   return () => {
  //     unsub();
  //   };
  // }, []);

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

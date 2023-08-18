import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Admin, Record } from "pocketbase";

import { pb } from "../api/pocketbase";
import { User } from "../models/user";

type AuthContextFunctions = {
  register: (data: {
    username: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;

  login: (data: { username: string; password: string }) => {};
  logout: () => void;
  changePassword: (data: {
    oldPassword: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;
};

type AuthContextTypeLoggedOut = {
  isLoggedIn: false;
  user: null;
} & AuthContextFunctions;

type AuthContextTypeLoggedIn = {
  isLoggedIn: true;
  user: User;
} & AuthContextFunctions;

const AuthContext = createContext<
  AuthContextTypeLoggedOut | AuthContextTypeLoggedIn
>({
  isLoggedIn: false,
  user: null,

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

export const AuthProvider = (props: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      passwordConfirm: string;
    }) => {
      await pb.collection("users").create(data);
      await login(data);
    },
    [],
  );

  const login = useCallback(
    async (data: { username: string; password: string }) => {
      await pb
        .collection("users")
        .authWithPassword(data.username, data.password);
    },
    [],
  );

  const logout = useCallback(() => {
    console.log("LOGOUT");
    pb.authStore.clear();
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (data: {
      oldPassword: string;
      password: string;
      passwordConfirm: string;
    }) => {
      if (user) {
        await pb.collection("users").update(user.id, data);
        logout();
      }
    },
    [user],
  );

  useEffect(() => {
    const updateUser = (model: Record | Admin | null) => {
      if (model && model instanceof Record) {
        const user = User.parse(model);
        setUser(user);
      } else {
        setUser(null);
      }
    };

    if (pb.authStore.isValid) {
      updateUser(pb.authStore.model);
    }

    const unsub = pb.authStore.onChange((token, model) => {
      console.log("onChange", model);
      console.log("onChange", token);
      updateUser(model);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    console.log("TEST");
  }, [pb.authStore.isValid]);

  const base = {
    register,
    login,
    logout,
    changePassword,
  };

  console.log(user);
  console.log("Model", pb.authStore.isValid);

  return (
    <AuthContext.Provider
      value={
        user !== null
          ? {
              isLoggedIn: true,
              user,
              ...base,
            }
          : {
              isLoggedIn: false,
              user: null,
              ...base,
            }
      }
    >
      {props.children}
    </AuthContext.Provider>
  );
};

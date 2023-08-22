import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Admin, Record } from "pocketbase";

import { User } from "../api/models/users";
import { pb } from "../api/pocketbase";

type AuthContext = {
  isLoggedIn: boolean;
  user: User | null;

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
  const [isLoggedIn, setLoggedIn] = useState(pb.authStore.isValid);

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
    setLoggedIn(false);
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
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
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

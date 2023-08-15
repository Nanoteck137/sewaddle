import { useCallback, useEffect, useState } from "react";
import { Record } from "pocketbase";
import { z } from "zod";

import { pb } from "../api/pocketbase";
import { Collection } from "../models/collection";

const UserSchema = Collection.extend({
  username: z.string(),
});
type UserSchema = z.infer<typeof UserSchema>;

export const useAuth = () => {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [isLoggedIn, setLoggedIn] = useState(pb.authStore.isValid);

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
        console.log("User", user);
        await pb.collection("users").update(user.id, data);
        logout();
      }
    },
    [user],
  );

  useEffect(() => {
    const current = pb.authStore.model;
    if (current && current instanceof Record) {
      const user = UserSchema.parse(current);
      setUser(user);
    } else {
      setUser(null);
      setLoggedIn(false);
    }

    const unsub = pb.authStore.onChange((_token, model) => {
      console.log("onChange", model);
      if (model && model instanceof Record) {
        const user = UserSchema.parse(model);
        setUser(user);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return { user, isLoggedIn, register, login, logout, changePassword };
};

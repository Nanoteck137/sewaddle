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
  }, []);

  useEffect(() => {
    const current = pb.authStore.model;
    if (current && current instanceof Record) {
      const user = UserSchema.parse(current);
      setUser(user);
    } else {
      setUser(null);
    }

    const unsub = pb.authStore.onChange((_token, model) => {
      if (model && model instanceof Record) {
        const user = UserSchema.parse(model);
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  return { user, register, login, logout };
};

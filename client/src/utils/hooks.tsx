import { useEffect, useState } from "react";
import { Api } from "../api/api";
import { User } from "../api/models";
import { getToken, removeToken } from "./miscFunctions";

type UserInfo = () => {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
  logout: () => void;
  api: Api;
};

export const useUserInfo: UserInfo = () => {
  const [user, setUser] = useState<User>();
  const [api] = useState(new Api());

  const logout = () => {
    removeToken();
    setUser(undefined);
  };

  useEffect(() => {
    if (user) return;
    if (!getToken()) return;
    api.getUser().then((user) => {
      if (!user) return;
      setUser(user);
    });
  }, []);

  return { user, setUser, logout, api };
};

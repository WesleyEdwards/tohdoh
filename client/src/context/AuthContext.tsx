import { createContext } from "react";
import { Api } from "../api/api";
import { User } from "../api/models";

export const AuthContext = createContext({
  user: {} as User,
  setUser: (user: User) => {},
  logout: () => {},
  api: {} as Api,
});

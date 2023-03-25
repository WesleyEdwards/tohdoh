import { createContext } from "react";
import { Api } from "../api/api";
import { User } from "../api/models";

export const UnAuthContext = createContext({
  setUser: (user: User) => {},
  api: {} as Api,
});

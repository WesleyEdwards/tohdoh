import { getToken, setTokenToLocalStorage } from "../utils/miscFunctions";
import { CreateUserBody, LoginBody } from "./apiTypes";
import { Reptile, User, Schedule, HusbandryRecord, Feeding } from "./models";

type Method = "get" | "post" | "put" | "delete";

export class Api {
  private token = "";
  private baseUrl = "http://localhost:8000/api";

  constructor() {
    const token = getToken();
    if (token) {
      this.token = token;
    }
  }
  private async makeRequest(
    path: string,
    method: Method,
    body: Record<string, any> = {}
  ) {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    };

    if (method === "post" || method === "put") {
      options.body = JSON.stringify(body);
    }

    const result = await fetch(`${this.baseUrl}/${path}`, options);
    return result.json();
  }

  get(path: string) {
    return this.makeRequest(path, "get");
  }

  post(path: string, body: Record<string, any>) {
    return this.makeRequest(path, "post", body);
  }

  put(path: string, body: Record<string, any>) {
    return this.makeRequest(path, "put", body);
  }

  del(path: string) {
    return this.makeRequest(path, "delete");
  }

  setToken(token: string) {
    if (!token) return;
    this.token = token;
    setTokenToLocalStorage(token);
  }

  createAccount(body: CreateUserBody): Promise<User> {
    return this.post("users", body).then((res) => {
      this.setToken(res.token);
      return res.user;
    });
  }

  signIn(body: LoginBody): Promise<User> {
    return this.post("token", body).then((res) => {
      this.setToken(res.token);
      return res.user;
    });
  }
  getUser(): Promise<User | null> {
    return this.get("users").then((res) => {
      if (!res?.user) return null;
      this.setToken(res.token);
      return res.user;
    });
  }
}

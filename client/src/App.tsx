import { RouterProvider } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { UnAuthContext } from "./context/UnAuthContext";
import { authRouter, unAuthRouter } from "./router/RouteHelpers";
import { useUserInfo } from "./utils/hooks";

function App() {
  const { user, setUser, logout, api } = useUserInfo();
  return (
    <>
      {user ? (
        <AuthContext.Provider value={{ user, setUser, logout, api }}>
          <RouterProvider router={authRouter} />
        </AuthContext.Provider>
      ) : (
        <UnAuthContext.Provider value={{ setUser, api }}>
          <RouterProvider router={unAuthRouter} />
        </UnAuthContext.Provider>
      )}
    </>
  );
}

export default App;

import { RouterProvider } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AuthContext } from "./context/AuthContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UnAuthContext } from "./context/UnAuthContext";
import { authRouter, unAuthRouter } from "./router/RouteHelpers";
import { useUserInfo } from "./utils/hooks";

function App() {
  const { user, setUser, logout, api } = useUserInfo();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {user ? (
        <AuthContext.Provider value={{ user, setUser, logout, api }}>
          <RouterProvider router={authRouter} />
        </AuthContext.Provider>
      ) : (
        <UnAuthContext.Provider value={{ setUser, api }}>
          <RouterProvider router={unAuthRouter} />
        </UnAuthContext.Provider>
      )}
    </LocalizationProvider>
  );
}

export default App;

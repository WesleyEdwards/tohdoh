import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import HeaderNav from "../components/HeaderNav";
import CreateAccount from "../pages/CreateAccount";
import { CreateSchedule } from "../pages/CreateSchedule";
import Dashboard from "../pages/Dashboard";
import { Landing } from "../pages/Landing";
import Profile from "../pages/Profile";
import SignIn from "../pages/SignIn";

type RoutePath =
  | "landing"
  | "sign-in"
  | "create-account"
  | "dashboard"
  | "profile"
  | "schedules";

export const authRoutes: RoutePath[] = ["dashboard", "schedules", "profile"];

export const unAuthRoutes: RoutePath[] = [
  "landing",
  "sign-in",
  "create-account",
];

export const routeMap: Record<RoutePath, JSX.Element> = {
  landing: <Landing />,
  "sign-in": <SignIn />,
  "create-account": <CreateAccount />,
  dashboard: <Dashboard />,
  profile: <Profile />,
  schedules: <CreateSchedule />,
};

export const authRouter = createBrowserRouter([
  {
    path: "/",
    element: <HeaderNav auth={true} />,
    children: [
      ...generateRouteObjects(authRoutes),
      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },
]);

export const unAuthRouter = createBrowserRouter([
  {
    path: "/",
    element: <HeaderNav />,
    children: [
      ...generateRouteObjects(unAuthRoutes),
      { path: "*", element: <Navigate to="landing" replace /> },
    ],
  },
]);

function generateRouteObjects(routes: RoutePath[]): RouteObject[] {
  return routes.map((route) => {
    return {
      path: route,
      element: routeMap[route],
    };
  });
}

import { Stack, Typography } from "@mui/material";
import React, { FC, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { NavigationTabs } from "./NavigationTabs";
import { UserIcon } from "./UserIcon";

export type TabPaths =
  | "home"
  | "dashboard"
  | "schedules"
  | "profile"
  | "reptiles";

const authTabInfo: Partial<Record<TabPaths, string>> = {
  dashboard: "Dashboard",
  schedules: "Schedules",
  profile: "Profile",
};

export const HeaderNav: FC<{ auth?: boolean }> = ({ auth = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    location.pathname === "/" && navigate("/home");
  }, []);

  return (
    <>
      <Stack
        justifyContent="end"
        width="100%"
        direction="row"
        alignItems="center"
        gap="2rem"
      >
        {auth && <NavigationTabs tabInfo={authTabInfo} />}
        <UserIcon auth={auth} />
      </Stack>
      <Outlet />
    </>
  );
};

export default HeaderNav;

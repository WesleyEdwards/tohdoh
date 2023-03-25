import { Tab, Tabs } from "@mui/material";
import React, { FC, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TabPaths } from "./HeaderNav";

type NavigationTabs = {
  tabInfo: Partial<Record<TabPaths, string>>;
};
export const NavigationTabs: FC<NavigationTabs> = (props) => {
  const { tabInfo } = props;
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(findIndex(location.pathname));
  const navigation = useNavigate();

  function findIndex(path: string) {
    const index = Object.keys(tabInfo).indexOf(path.slice(1));
    if (index === -1) return false;
    return index;
  }

  const handleChange = (e: React.SyntheticEvent, newValue: number) => {
    const paths = Object.keys(tabInfo) as TabPaths[];
    navigation(`/${paths[newValue]}`);
  };

  useEffect(() => {
    setSelectedTab(findIndex(location.pathname));
  }, [location.pathname]);

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleChange} scrollButtons="auto">
        {Object.keys(tabInfo).map((path) => (
          <Tab key={path} label={tabInfo[path as TabPaths]} />
        ))}
      </Tabs>
    </div>
  );
};

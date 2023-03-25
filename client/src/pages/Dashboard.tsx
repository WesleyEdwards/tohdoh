import { Container, Stack, Typography } from "@mui/material";
import React, { FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderTitle } from "../components/HeaderTitle";
import { UnAuthContext } from "../context/UnAuthContext";

export const Dashboard: FC = () => {
  const { setUser, api } = useContext(UnAuthContext);
  const navigation = useNavigate();

  return (
    <Container maxWidth="md">
      <HeaderTitle
        title="Welcome to Tohdoh"
        secondaryHeader={
          <Typography textAlign="end" variant="h5" sx={{ color: "grey" }}>
            Where Todos turn to Done
          </Typography>
        }
      />
    </Container>
  );
};

export default Dashboard;

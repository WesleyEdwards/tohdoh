import { Alert, Button, Container, Stack, Typography } from "@mui/material";
import React, { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetMineRes } from "../api/models";
import { HeaderTitle } from "../components/HeaderTitle";
import { Spinner } from "../components/Spinner";
import { AuthContext } from "../context/AuthContext";
import { hasUnscheduledEvents } from "../utils/miscFunctions";

export const Dashboard: FC = () => {
  const { setUser, api } = useContext(AuthContext);
  const navigation = useNavigate();

  const [mySchedules, setMySchedules] = useState<GetMineRes | null>();

  useEffect(() => {
    api.getMySchedulers().then((res) => {
      setMySchedules(res);
    });
  }, []);

  if (!mySchedules) return <Spinner />;

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
      {hasUnscheduledEvents(mySchedules) && (
        <Alert
          severity="info"
          variant="filled"
          action={
            <Button
              variant="outlined"
              sx={{ color: "black", borderColor: "black" }}
              onClick={() => navigation("/schedules")}
            >
              View Schedules
            </Button>
          }
        >
          You have unscheduled events
        </Alert>
      )}
    </Container>
  );
};

export default Dashboard;

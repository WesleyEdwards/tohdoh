import { Container, Stack, Typography } from "@mui/material";
import React, { FC, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetMineRes } from "../api/models";
import { HeaderTitle } from "../components/HeaderTitle";
import { Spinner } from "../components/Spinner";
import { AuthContext } from "../context/AuthContext";
import { UnAuthContext } from "../context/UnAuthContext";

export const Dashboard: FC = () => {
  const { setUser, api } = useContext(AuthContext);
  const navigation = useNavigate();

  const [mySchedules, setMySchedules] = useState<GetMineRes | null>();

  useEffect(() => {
    api.getMySchedulers().then((res) => {
      setMySchedules(res);
    });
  }, []);

  if (mySchedules === null) return <Spinner />;

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
      <Typography>My Schedules</Typography>
      {mySchedules ? (
        <>
          {/* <Stack>
            {mySchedules.scheduledEventSchedulers.map((schedule) => (
              <div key={schedule.id}>{schedule.base.name}</div>
            ))}
          </Stack>
          <Stack>
            {mySchedules.dueDateEventSchedulers.map((schedule) => (
              <div key={schedule.id}>{schedule.base.name}</div>
            ))}
          </Stack>
          <Stack>
            {mySchedules.unscheduledEventSchedulers.map((schedule) => (
              <div key={schedule.id}>{schedule.base.name}</div>
            ))}
          </Stack> */}
        </>
      ) : (
        <Spinner />
      )}
    </Container>
  );
};

export default Dashboard;

import {
  Button,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { HeaderTitle } from "../components/HeaderTitle";
import { CreateScheduleButton } from "../components/CreateScheduleButton";
import { CreateDueDateEvent } from "../components/CreateDueDateEvent";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { GetMineRes } from "../api/models";
import { Spinner } from "../components/Spinner";
import ScheduleCard from "../components/ScheduleCard";
import { hasUnscheduledEvents } from "../utils/miscFunctions";
import { GenerateSchedule } from "../components/GenerateSchedule";

export const CreateSchedule = () => {
  const { api } = useContext(AuthContext);
  const [mySchedules, setMySchedules] = useState<GetMineRes>();

  const fetchSchedules = () => {
    setMySchedules(undefined);
    api.getMySchedulers().then((res) => setMySchedules(res));
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (!mySchedules) return <Spinner />;

  const onCreate = () => fetchSchedules();

  const {
    unscheduledEventSchedulers,
    scheduledEventSchedulers,
    dueDateEventSchedulers,
  } = mySchedules;

  return (
    <Container maxWidth="md">
      <HeaderTitle title="Manage Schedules" />
      {hasUnscheduledEvents(mySchedules) && (
        <GenerateSchedule mySchedules={mySchedules} onCreate={onCreate} />
      )}

      <HeaderTitle title="Schedules" secondary>
        <CreateScheduleButton onCreate={onCreate} />
      </HeaderTitle>

      {scheduledEventSchedulers.length === 0 &&
      unscheduledEventSchedulers.length === 0 &&
      dueDateEventSchedulers.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          No schedules yet!
        </Typography>
      ) : (
        <Stack spacing="2rem">
          <Grid container spacing={4} paddingTop={8}>
            {scheduledEventSchedulers.map((x) => (
              <Grid item key={x.id}>
                <ScheduleCard schedule={x.base} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={4} paddingTop={8}>
            {unscheduledEventSchedulers.map((x) => (
              <Grid item key={x.id}>
                <ScheduleCard schedule={x.base} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      <Divider sx={{ pt: "2rem" }} />
      <HeaderTitle title="Deadlines" secondary>
        <CreateDueDateEvent onCreate={onCreate} />
      </HeaderTitle>
      <Grid container spacing={4} paddingTop={8}>
        {dueDateEventSchedulers.map((x) => (
          <Grid item key={x.id}>
            <ScheduleCard schedule={x.base} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

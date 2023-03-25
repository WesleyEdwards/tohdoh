import { Button, Container, Stack, Typography } from "@mui/material";
import { HeaderTitle } from "../components/HeaderTitle";
import { CreateScheduleButton } from "../components/CreateScheduleButton";
import { CreateDueDateEvent } from "../components/CreateDueDateEvent";

export const CreateSchedule = () => {
  return (
    <Container maxWidth="md">
      <HeaderTitle title="Manage Schedules" />

      <HeaderTitle title="Schedules" secondary>
        <CreateScheduleButton />
      </HeaderTitle>

      <HeaderTitle title="Events" secondary>
        <CreateDueDateEvent />
      </HeaderTitle>
    </Container>
  );
};

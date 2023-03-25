import { Card, CardContent, Typography } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  camelToTitleCase,
  isoStringToLocalDateTime,
} from "../utils/miscFunctions";
import { EventSchedulerBase } from "../api/models";

interface ScheduleCardProps {
  schedule: EventSchedulerBase;
}

export const ScheduleCard: FC<ScheduleCardProps> = (props) => {
  const { schedule } = props;

  const navigate = useNavigate();

  return (
    <Card
      sx={{ minWidth: "12rem" }}
      //   onClick={() => {
      //     navigate(`/reptile/${reptile.id}`);
      //   }}
    >
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {schedule.name}
        </Typography>
        <Typography variant="h5" component="div">
          {schedule.scheduledEvent?.startDateTime
            ? isoStringToLocalDateTime(schedule.scheduledEvent.startDateTime)
            : "Not Scheduled Yet"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;

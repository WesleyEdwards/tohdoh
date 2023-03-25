import { Card, CardContent, Typography } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  camelToTitleCase,
  isoStringToLocalDateTime,
} from "../utils/miscFunctions";
import { Event } from "../api/models";

interface EventCardProps {
  event: Event;
}

export const EventCard: FC<EventCardProps> = (props) => {
  const { event } = props;

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
          {event.scheduler.name}
        </Typography>
        <Typography variant="h5" component="div">
          {event.complete ? "✅" : "🔲"}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {isoStringToLocalDateTime(event.start)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EventCard;

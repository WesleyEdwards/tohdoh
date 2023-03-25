import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FC, useState } from "react";
import { CreateScheduledEvent } from "./CreateScheduledEvent";
import CreateUnscheduledEvent from "./CreateUnscheduledEvent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type WhichType = "fixed-time" | "flexible-time";

export const CreateScheduleButton: FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const [open, setOpen] = useState(false);

  const [whichType, setWhichType] = useState<WhichType>("fixed-time");

  const handleClose = () => {
    setOpen(false);
    onCreate();
  };

  const handleCreate = () => {
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<AddIcon />}
      >
        Event
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add To Calendar</DialogTitle>
        <DialogContent>
          <Stack gap="2rem">
            <Stack direction="row" alignItems="center" gap="1rem">
              <FormControl sx={{ my: "2rem" }} fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  fullWidth
                  value={whichType}
                  label="Event Type"
                  onChange={(e) => setWhichType(e.target.value as WhichType)}
                >
                  <MenuItem value={"fixed-time"}>Fixed Time</MenuItem>
                  <MenuItem value={"flexible-time"}>Flexible Time</MenuItem>
                </Select>
              </FormControl>
              <Tooltip
                children={<InfoOutlinedIcon fontSize="large" />}
                title={
                  whichType === "fixed-time"
                    ? "Needs to happen at a specific time. (e.g. someone's birthday, a weekly meeting, or picking up Grandma)"
                    : "Does not have to happen at a specified time (e.g. cleaning the house or going to the gym)"
                }
              />
            </Stack>

            <Divider />

            {whichType === "fixed-time" ? (
              <CreateScheduledEvent onCreate={handleCreate} />
            ) : whichType === "flexible-time" ? (
              <CreateUnscheduledEvent onCreate={handleCreate} />
            ) : null}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

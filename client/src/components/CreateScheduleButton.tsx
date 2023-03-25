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
import { useState } from "react";
import { CreateScheduledEvent } from "./CreateScheduledEvent";
import CreateUnscheduledEvent from "./CreateUnscheduledEvent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type WhichType = "repeated" | "unscheduled";

export const CreateScheduleButton = () => {
  const [open, setOpen] = useState(false);

  const [whichType, setWhichType] = useState<WhichType>("repeated");

  const handleClose = () => {
    setOpen(false);
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
        Add Schedule
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add To Calendar</DialogTitle>
        <DialogContent>
          <Stack gap="2rem">
            <Stack direction="row" alignItems="center" gap="1rem">
              <FormControl sx={{ my: "2rem" }} fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  fullWidth
                  value={whichType}
                  label="Schedule Type"
                  onChange={(e) => setWhichType(e.target.value as WhichType)}
                >
                  <MenuItem value={"repeated"}>Repeated</MenuItem>
                  <MenuItem value={"unscheduled"}>Unscheduled</MenuItem>
                </Select>
              </FormControl>
              <Tooltip
                children={<InfoOutlinedIcon fontSize="large" />}
                title={
                  whichType === "repeated"
                    ? "Repeated events happen on the same day at the same time. e.g. someone's birthday, a weekly meeting, or picking up Grandma."
                    : "Unscheduled events do not have to happen on same day or time. e.g. cleaning the house or going to the gym."
                }
              />
            </Stack>

            <Divider />

            {whichType === "repeated" ? (
              <CreateScheduledEvent onCreate={handleCreate} />
            ) : whichType === "unscheduled" ? (
              <CreateUnscheduledEvent onCreate={handleCreate} />
            ) : null}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

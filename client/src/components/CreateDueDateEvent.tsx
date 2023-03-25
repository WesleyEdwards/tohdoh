import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  TextFieldProps,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FC, useContext, useState } from "react";
import { emptyBaseBody } from "../utils/emptyObjects";
import { CreateDueDateEventSchedulerBody } from "../api/apiTypes";
import { CreateBaseBody } from "./CreateBaseBody";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AuthContext } from "../context/AuthContext";
import { DateTimePicker } from "@mui/x-date-pickers";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const CreateDueDateEvent: FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const { api } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduler, setScheduler] = useState<CreateDueDateEventSchedulerBody>({
    baseInfo: { ...emptyBaseBody },
    dueDateTime: "",
    blockSize: 0,
  });
  const [date, setDate] = useState<Date>();

  const dirty = [
    scheduler.baseInfo.name === "",
    date === new Date(),
    scheduler.blockSize === 0,
  ].some((x) => x);

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setScheduler({
      baseInfo: { ...emptyBaseBody },
      dueDateTime: "",
      blockSize: 0,
    });
    setDate(undefined);
  };

  const handleCreate = () => {
    if (!date) return;
    api.createDueDateEventScheduler({
      ...scheduler,
      baseInfo: {
        ...scheduler.baseInfo,
        duration: scheduler.baseInfo.duration * 60,
      },
      blockSize: scheduler.blockSize * 60,
      dueDateTime: date.toISOString(),
    });
    handleClose();
    onCreate();
  };

  return (
    <>
      <Tooltip
        children={
          <Button
            variant="outlined"
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
          >
            Deadline
          </Button>
        }
        title="Something you need to do before a due date (e.g. study for a test)"
      />

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add To Calendar</DialogTitle>
        <DialogContent>
          <CreateBaseBody
            body={scheduler.baseInfo}
            deadline
            setBody={(newScheduler) =>
              setScheduler((prevState) => ({
                ...prevState,
                baseInfo: newScheduler,
              }))
            }
          />
          <Stack
            direction="row"
            width="100%"
            alignItems="center"
            gap="1rem"
            justifyContent="space-between"
          >
            <TextField
              value={scheduler.blockSize}
              sx={{ mt: "1rem" }}
              fullWidth
              type="number"
              onChange={(e) =>
                setScheduler((prevState) => ({
                  ...prevState,
                  blockSize: parseInt(e.target.value),
                }))
              }
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 24,
                },
                endAdornment: (
                  <InputAdornment position="start" sx={{ px: "5px" }}>
                    hr
                  </InputAdornment>
                ),
              }}
              label="Allocated Time"
            />

            <Tooltip
              children={
                <InfoOutlinedIcon sx={{ mt: "10px" }} fontSize="large" />
              }
              title="How much time you want to spend each time you prepare for the deadline (e.g. study for 2 hours)"
            />
          </Stack>

          <div style={{ width: "100%", paddingBlock: "2rem" }}>
            <DateTimePicker
              label="Deadline"
              value={date}
              onChange={(newValue) => {
                setDate(newValue as Date);
              }}
              disablePast
              renderInput={(params) => <TextField {...params} />}
              views={["year", "month", "day", "hours", "minutes"]}
            />
          </div>
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" disabled={dirty} onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

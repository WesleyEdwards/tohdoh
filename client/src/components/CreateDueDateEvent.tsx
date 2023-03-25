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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useContext, useState } from "react";
import { emptyBaseBody } from "../utils/emptyObjects";
import { CreateDueDateEventSchedulerBody } from "../api/apiTypes";
import { CreateBaseBody } from "./CreateBaseBody";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AuthContext } from "../context/AuthContext";

export const CreateDueDateEvent = () => {
  const { api } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduler, setScheduler] = useState<CreateDueDateEventSchedulerBody>({
    baseInfo: { ...emptyBaseBody },
    dueDateTime: "",
    blockSize: 0,
  });
  const [date, setDate] = useState(new Date());

  const dirty = [
    scheduler.baseInfo.name === "",
    date === new Date(),
    scheduler.blockSize === 0,
  ].some((x) => x);

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleCreate = () => {
    api.createDueDateEventScheduler({
      ...scheduler,
      dueDateTime: date.toISOString(),
    });
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<AddIcon />}
      >
        Add Event
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add To Calendar</DialogTitle>
        <DialogContent>
          <CreateBaseBody
            body={scheduler.baseInfo}
            setBody={(newScheduler) =>
              setScheduler((prevState) => ({
                ...prevState,
                baseInfo: newScheduler,
              }))
            }
          />
          <Stack direction="row" width="100%" justifyContent="space-between">
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
              label="Alloted Time"
            />
          </Stack>

          <div style={{ width: "100%", paddingBlock: "2rem" }}>
            <DatePicker
              label="Basic date picker"
              value={date}
              minDate={new Date()}
              onChange={(e) => setDate(e ?? new Date())}
              renderInput={(params: TextFieldProps) => (
                <TextField {...params} />
              )}
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
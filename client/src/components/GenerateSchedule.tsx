import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FC, useContext, useState } from "react";
import { GetMineRes } from "../api/models";
import { AuthContext } from "../context/AuthContext";
import { DateTimePicker } from "@mui/x-date-pickers";
import { RepeatType } from "../api/apiTypes";

type GenerateScheduleProps = {
  mySchedules: GetMineRes;
  onCreate: () => void;
};

export const GenerateSchedule: FC<GenerateScheduleProps> = ({
  onCreate,
  mySchedules,
}) => {
  const { api } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [whenToSchedule, setWhenToSchedule] = useState<number>();

  const handleClose = () => setOpen(false);
  const handleSubmit = async () => {
    if (!whenToSchedule) return;
    const icalData = await api.generateTheDangSchedule(whenToSchedule * 30);
    onCreate();
    handleClose();

    downloadIcalFile(icalData, "my-calendar.ics");

  };

  return (
    <>
      <Button fullWidth variant="contained" onClick={() => setOpen(true)}>
        Generate Schedule
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          How Far in advance would you like the schedule?
        </DialogTitle>
        <DialogContent>
          <TextField
            value={whenToSchedule}
            sx={{ mt: "1rem", maxWidth: "20rem" }}
            fullWidth
            type="number"
            onChange={(e) => {
              setWhenToSchedule(parseInt(e.target.value));
            }}
            InputProps={{
              inputProps: {
                min: 0,
                max: 24,
              },
              endAdornment: (
                <InputAdornment position="start" sx={{ px: "5px" }}>
                  months
                </InputAdornment>
              ),
            }}
            label="Months in advance"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={!whenToSchedule} onClick={handleSubmit}>
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export function downloadIcalFile(icalData: string, fileName: string) {
  const icalBlob = new Blob([icalData], {
    type: "text/calendar;charset=utf-8",
  });
  const icalUrl = URL.createObjectURL(icalBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = icalUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { FC, useContext, useState } from "react";
import { CreateScheduledEventSchedulerBody, RepeatType } from "../api/apiTypes";
import { AuthContext } from "../context/AuthContext";
import { Day, dayMap } from "../utils/constants";
import { emptyBaseBody } from "../utils/emptyObjects";
import { camelToTitleCase } from "../utils/miscFunctions";
import { CreateBaseBody } from "./CreateBaseBody";

export const CreateScheduledEvent: FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const { api } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [scheduler, setScheduler] = useState<CreateScheduledEventSchedulerBody>(
    {
      repeatInfo: {
        repeatType: "YEARLY",
        days: [],
      },
      baseInfo: { ...emptyBaseBody },
      startDateTime: "",
      endDateTime: "",
    }
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleCreateSchedule = () => {
    api.createScheduledEventScheduler(scheduler).then((res) => {
      if (res.error) return setError(res.error);
      handleClose();
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setScheduler((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const dayIndex = dayMap[name as Day];

    if (checked) {
      setScheduler((prevState) => ({
        ...prevState,
        repeatInfo: {
          ...prevState.repeatInfo,
          days: [...prevState.repeatInfo.days, dayIndex],
        },
      }));
    } else {
      setScheduler((prevState) => ({
        ...prevState,
        repeatInfo: {
          ...prevState.repeatInfo,
          days: prevState.repeatInfo.days.filter((day) => day !== dayIndex),
        },
      }));
    }
  };

  const dirty = [
    scheduler.baseInfo.name,
    scheduler.endDateTime,
    scheduler.startDateTime,
  ].some((field) => field !== "");

  const handleClose = () => {
    onCreate();
    setError(null);
    setScheduler({
      repeatInfo: {
        repeatType: "YEARLY",
        days: [],
      },
      baseInfo: { ...emptyBaseBody },
      startDateTime: "",
      endDateTime: "",
    });
  };

  return (
    <>
      <CreateBaseBody
        body={scheduler.baseInfo}
        setBody={(newScheduler) =>
          setScheduler((prevState) => ({
            ...prevState,
            baseInfo: newScheduler,
          }))
        }
      />
      <FormControl sx={{ my: "2rem" }} fullWidth>
        <InputLabel>Frequency</InputLabel>
        <Select
          value={scheduler.repeatInfo.repeatType}
          label="Frequency"
          onChange={(e) => {
            setScheduler((prevState) => ({
              ...prevState,
              repeatInfo: {
                ...prevState.repeatInfo,
                repeatType: e.target.value as RepeatType,
              },
            }));
          }}
        >
          <MenuItem value={"WEEKLY"}>Weekly</MenuItem>
          <MenuItem value={"MONTHLY"}>Monthly</MenuItem>
          <MenuItem value={"YEARLY"}>Yearly</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" flexWrap={"wrap"}>
        {Object.entries(dayMap).map(([day, index]) => {
          return (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  name={day}
                  checked={scheduler.repeatInfo.days.includes(index)}
                  onChange={handleCheckboxChange}
                />
              }
              label={camelToTitleCase(day)}
            />
          );
        })}
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <DatePicker
          label="Start Date"
          value={startDate}
          minDate={new Date()}
          onChange={(e) => setStartDate(e ?? new Date())}
          renderInput={(params: TextFieldProps) => <TextField {...params} />}
        />
        <Divider
          orientation="horizontal"
          sx={{ width: "5px", alignSelf: "center", color: "white" }}
          light={false}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          minDate={new Date()}
          onChange={(e) => setEndDate(e ?? new Date())}
          renderInput={(params: TextFieldProps) => <TextField {...params} />}
        />
      </Stack>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={dirty}
          onClick={handleCreateSchedule}
        >
          Create
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateScheduledEvent;

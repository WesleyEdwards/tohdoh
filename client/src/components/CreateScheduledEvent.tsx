import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Button,
  Checkbox,
  DialogActions,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { FC, useContext, useState } from "react";
import {
  CreateScheduledEventSchedulerBody,
  CreateUnscheduledEventSchedulerBody,
  RepeatType,
} from "../api/apiTypes";
import { AuthContext } from "../context/AuthContext";
import { Day, dayMap, dayOfYear, monthMap } from "../utils/constants";
import { emptyBaseBody } from "../utils/emptyObjects";
import { addHoursToDate, camelToTitleCase } from "../utils/miscFunctions";
import { CreateBaseBody } from "./CreateBaseBody";

export const CreateScheduledEvent: FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const { api } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [scheduler, setScheduler] = useState<CreateScheduledEventSchedulerBody>(
    {
      repeatInfo: {
        repeatType: "WEEKLY",
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
    if (!startDate || !endDate) return;
    const formatted: CreateScheduledEventSchedulerBody = {
      ...scheduler,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      repeatInfo: {
        ...scheduler.repeatInfo,
        days:
          scheduler.repeatInfo.repeatType === "YEARLY"
            ? [dayOfYear(startDate)]
            : scheduler.repeatInfo.days,
      },
    };
    api.createScheduledEventScheduler(formatted).then((res) => {
      if (res.error) return setError(res.error);
      handleClose();
    });
    onCreate();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setScheduler((prevState) => ({ ...prevState, [name]: value }));
  };

  const [repeats, setRepeats] = useState<boolean>(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const dayIndex =
      scheduler.repeatInfo.repeatType === "WEEKLY"
        ? dayMap[name as Day]
        : monthMap[name as Day];

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

  const dirty = [scheduler.baseInfo.name, startDate].some((field) => !field);

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
        <FormControlLabel
          control={
            <Checkbox
              checked={repeats}
              onChange={(e) => setRepeats(!repeats)}
              name="Repeats"
            />
          }
          label="Repeats"
        />
      </FormControl>

      {repeats ? (
        <>
          <FormControl sx={{ my: "2rem" }} fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={scheduler.repeatInfo.repeatType}
              label="Frequency"
              onChange={(e) => {
                setScheduler((prevState) => ({
                  ...prevState,
                  repeatInfo: {
                    days: [],
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
            {(() => {
              if (scheduler.repeatInfo.repeatType === "MONTHLY") {
                return (
                  <>
                    {Object.entries(monthMap).map(([month, index]) => {
                      return (
                        <FormControlLabel
                          key={month}
                          control={
                            <Checkbox
                              name={month}
                              checked={scheduler.repeatInfo.days.includes(
                                index
                              )}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={camelToTitleCase(month)}
                        />
                      );
                    })}
                  </>
                );
              }
              if (scheduler.repeatInfo.repeatType === "WEEKLY") {
                return (
                  <>
                    {Object.entries(dayMap).map(([day, index]) => {
                      return (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              name={day}
                              checked={scheduler.repeatInfo.days.includes(
                                index
                              )}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={camelToTitleCase(day)}
                        />
                      );
                    })}
                  </>
                );
              }
            })()}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <div style={{ width: "100%", paddingBlock: "2rem" }}>
              <DateTimePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue as Date);
                }}
                disablePast
                renderInput={(params) => <TextField {...params} />}
                views={["year", "month", "day", "hours", "minutes"]}
              />
            </div>
            <Divider
              orientation="horizontal"
              sx={{ width: "5px", alignSelf: "center", color: "white" }}
              light={false}
            />
            <div style={{ width: "100%", paddingBlock: "2rem" }}>
              <DateTimePicker
                label="End Date"
                value={endDate}
                minDate={startDate}
                onChange={(newValue) => {
                  setEndDate(newValue as Date);
                }}
                disablePast
                renderInput={(params) => <TextField {...params} />}
                views={["year", "month", "day", "hours", "minutes"]}
              />
            </div>
          </Stack>
        </>
      ) : (
        <Stack direction="row" justifyContent="space-between">
          <div style={{ width: "100%", paddingBlock: "2rem" }}>
            <DateTimePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue as Date);
              }}
              disablePast
              renderInput={(params) => <TextField {...params} />}
              views={["year", "month", "day", "hours", "minutes"]}
            />
          </div>
          <Divider
            orientation="horizontal"
            sx={{ width: "5px", alignSelf: "center", color: "white" }}
            light={false}
          />
          <div style={{ width: "100%", paddingBlock: "2rem" }}>
            <DateTimePicker
              label="End Date"
              value={endDate}
              minDate={startDate}
              onChange={(newValue) => {
                setEndDate(newValue as Date);
              }}
              disablePast
              renderInput={(params) => <TextField {...params} />}
              views={["year", "month", "day", "hours", "minutes"]}
            />
          </div>
        </Stack>
      )}
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

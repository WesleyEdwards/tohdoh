import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { FC, useContext, useState } from "react";
import {
  CreateUnscheduledEventSchedulerBody,
  RepeatType,
} from "../api/apiTypes";
import { AuthContext } from "../context/AuthContext";
import { Day, dayMap, daysList } from "../utils/constants";
import { emptyBaseBody } from "../utils/emptyObjects";
import { camelToTitleCase } from "../utils/miscFunctions";
import { CreateBaseBody } from "./CreateBaseBody";

export const CreateUnscheduledEvent: FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const { api } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [scheduler, setScheduler] =
    useState<CreateUnscheduledEventSchedulerBody>({
      repeatInfo: {
        repeatType: "YEARLY",
        days: [],
      },
      baseInfo: { ...emptyBaseBody },
    });

  const handleCreateSchedule = () => {
    api.createUnscheduledEventScheduler(scheduler).then((res) => {
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

  const handleClose = () => {
    onCreate();
    setError(null);
    setScheduler({
      repeatInfo: {
        repeatType: "YEARLY",
        days: [],
      },
      baseInfo: { ...emptyBaseBody },
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

      {error && <Alert severity="error">{error}</Alert>}
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreateSchedule}>
          Create
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateUnscheduledEvent;

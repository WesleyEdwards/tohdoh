import { InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { CreateEventSchedulerBaseBody } from "../api/apiTypes";

type CreateBaseBodyProps = {
  body: CreateEventSchedulerBaseBody;
  setBody: (body: CreateEventSchedulerBaseBody) => void;
  deadline?: boolean;
};

export const CreateBaseBody: FC<CreateBaseBodyProps> = (props) => {
  const { body, setBody, deadline } = props;
  const [baseInfo, setBaseInfo] = useState<CreateEventSchedulerBaseBody>(body);

  useEffect(() => {
    setBody({
      ...body,
      name: baseInfo.name,
      duration: baseInfo.duration,
      priority: baseInfo.priority,
    });
  }, [baseInfo]);

  return (
    <Stack gap="2rem" sx={{ py: "1rem" }}>
      <TextField
        value={baseInfo.name}
        onChange={(e) =>
          setBaseInfo((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
        label={deadline ? "Deadline Name" : "Event Name"}
      />
      <Stack direction="row" width="100%" gap="1rem">
        <Tooltip
          children={
            <TextField
              sx={{ maxWidth: "18rem" }}
              fullWidth
              value={baseInfo.duration}
              type="number"
              onChange={(e) =>
                setBaseInfo((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value),
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
              label="Duration"
            />
          }
          title={
            deadline
              ? "much total time it will take to prepare for the deadline"
              : "how long the event will take"
          }
        />
        <TextField
          fullWidth
          value={baseInfo.priority}
          type="number"
          sx={{ maxWidth: "18rem" }}
          onChange={(e) =>
            setBaseInfo((prev) => ({
              ...prev,
              priority: parseInt(e.target.value),
            }))
          }
          InputProps={{
            inputProps: {
              min: 1,
              max: 10,
            },
            endAdornment: (
              <InputAdornment position="start" sx={{ px: "5px" }}>
                {"(1-10)"}
              </InputAdornment>
            ),
          }}
          label="Priority"
        />
      </Stack>
    </Stack>
  );
};

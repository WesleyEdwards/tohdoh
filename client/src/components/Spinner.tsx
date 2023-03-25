import { Box, BoxProps, CircularProgress } from "@mui/material";
import { FC } from "react";

interface SpinnerProps extends BoxProps {}

export const Spinner: FC<SpinnerProps> = (props) => {
  const { paddingY, ...rest } = props;

  return (
    <Box
      textAlign="center"
      width="100%"
      paddingY={paddingY ?? "3rem"}
      {...rest}
    >
      <CircularProgress />
    </Box>
  );
};

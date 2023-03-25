import { Divider, Stack, StackProps, Typography } from "@mui/material";
import { FC } from "react";

interface HeaderTitleProps extends StackProps {
  title?: string;
  editing?: boolean;
  secondary?: boolean;
  displayComponent?: JSX.Element;
}

export const HeaderTitle: FC<HeaderTitleProps> = (props) => {
  const { title, children, displayComponent, secondary = false } = props;
  return (
    <>
      <Stack
        direction="row"
        paddingTop="2rem"
        justifyContent="space-between"
        alignItems="center"
      >
        {displayComponent ? (
          <>{displayComponent}</>
        ) : (
          <Typography
            variant={secondary ? "h4" : "h3"}
            sx={{ mb: secondary ? "2rem" : undefined }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Stack>
      {!secondary && <Divider sx={{ my: "2rem" }} />}
    </>
  );
};

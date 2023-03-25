import {
  Button,
  Link,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";

export const Landing: FC = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md">
      <Typography variant="h1" sx={{ mb: 6 }} textAlign="center">
        Tohdoh
      </Typography>
      {/* <Typography variant="h5">What is Tohdoh?</Typography> */}
      <Divider sx={{ my: 2 }} />

      <Stack padding={2} gap={1}>
        <Typography>- Todo</Typography>
        <Typography>- Todoing</Typography>
        <Typography>- Todone</Typography>
        <Typography>- That's Todo</Typography>
      </Stack>

      <Stack
        justifyContent="center"
        alignItems="center"
        paddingTop="4rem"
        gap={4}
      >
        <Button
          variant="contained"
          sx={{ width: "12rem" }}
          onClick={() => navigate("/sign-in")}
        >
          Sign In
        </Button>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/create-account")}
        >
          Don't have an account?
        </Link>
      </Stack>
    </Container>
  );
};

export default Landing;

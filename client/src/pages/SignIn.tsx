import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnAuthContext } from "../context/UnAuthContext";

export const SignIn: FC = () => {
  const { setUser, api } = useContext(UnAuthContext);
  const navigation = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>();

  const handleSignIn = () => {
    setError(undefined);
    if (!email || !password) {
      setError("Please enter an email and password");
      return;
    }
    if (email.indexOf("@") === -1) {
      setError("Please enter a valid email");
      return;
    }

    api.signIn({ email, password }).then((user) => {
      if (!user) {
        setError("An error occurred");
        return;
      }
      setUser(user);
      navigation("/");
    });
  };

  const navCreateAccount = () => navigation("/create-account");

  return (
    <Container maxWidth="sm" sx={{ pt: 8 }}>
      <Card>
        <CardContent>
          <Stack gap="2rem" paddingX="1rem">
            <Typography variant="h4" textAlign="center">
              Sign In
            </Typography>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              size="large"
              sx={{ width: "12rem", alignSelf: "center", my: "1rem" }}
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Divider />
            <Button variant="text" size="small" onClick={navCreateAccount}>
              Create Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SignIn;

import Rect, { FC, useContext, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Button, IconButton, Popover, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const UserIcon: FC<{ auth?: boolean }> = ({ auth = false }) => {
  const navigation = useNavigate();
  const { logout } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const navigateToLogin = () => {
    onClose();
    navigation("/sign-in");
  };

  const navigateToSignup = () => {
    onClose();
    navigation("/create-account");
  };

  const onClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        sx={{ width: "3rem", height: "3rem", margin: "1rem" }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <AccountCircleIcon fontSize="large" />
      </IconButton>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack>
          {auth ? (
            <Button sx={{ p: 2 }} variant="text" onClick={logout}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button sx={{ p: 2 }} variant="text" onClick={navigateToLogin}>
                Sign In
              </Button>
              <Button sx={{ p: 2 }} variant="text" onClick={navigateToSignup}>
                Create Account
              </Button>
            </>
          )}
        </Stack>
      </Popover>
    </>
  );
};

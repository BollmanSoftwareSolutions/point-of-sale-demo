// Persistent footer navigation (Ordering / History / Kitchen) + Logout.
// See design-docs/03-ui-components.md (Shared Components).

import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Stack } from "@mui/material";
import { NavLink, useNavigate } from "react-router";
import { useAuthStore } from "../stores/authStore";

const links = [
  { to: "/order", label: "Ordering" },
  { to: "/history", label: "Order History" },
  { to: "/kitchen", label: "Kitchen" },
];

export function FooterNav() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      component="nav"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 3,
        py: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1}>
        {links.map((link) => (
          <Button
            key={link.to}
            component={NavLink}
            to={link.to}
            size="large"
            color="primary"
            sx={{
              fontWeight: 600,
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            {link.label}
          </Button>
        ))}
      </Stack>

      <Button
        onClick={handleLogout}
        size="large"
        color="error"
        variant="outlined"
        startIcon={<LogoutIcon />}
        sx={{ fontWeight: 600 }}
      >
        Logout
      </Button>
    </Box>
  );
}

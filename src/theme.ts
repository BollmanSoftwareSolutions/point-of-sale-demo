// MUI theme (palette, typography, sizing for large tablet displays).
// See design-docs/03-ui-components.md (Global Layout) and 06-project-structure.md.
//
// Color palette derived from the primary color #2eab4e (green). The `green`
// ramp is a tint/shade scale anchored on the primary at 500, used for the
// primary palette and green accents throughout the app.

import { createTheme } from "@mui/material/styles";

// Primary green ramp (anchored: 500 = #2eab4e).
const green = {
  50: "#eaf7ee",
  100: "#c6e9d0",
  200: "#9edab0",
  300: "#73cb8f",
  400: "#50bf76",
  500: "#2eab4e", // primary
  600: "#279644",
  700: "#1f7d38",
  800: "#17632c",
  900: "#0d461d",
};

// Complementary amber accent for secondary actions/highlights.
const amber = {
  light: "#ffcf5c",
  main: "#f5a524",
  dark: "#c77c00",
  contrastText: "#1b2419",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      light: green[300],
      main: green[500],
      dark: green[700],
      contrastText: "#ffffff",
    },
    secondary: {
      light: amber.light,
      main: amber.main,
      dark: amber.dark,
      contrastText: amber.contrastText,
    },
    success: {
      light: green[300],
      main: green[600],
      dark: green[800],
      contrastText: "#ffffff",
    },
    error: {
      light: "#ef5350",
      main: "#d32f2f",
      dark: "#a31515",
      contrastText: "#ffffff",
    },
    warning: {
      light: "#ffb74d",
      main: "#ed6c02",
      dark: "#b53d00",
      contrastText: "#ffffff",
    },
    info: {
      light: "#4fc3f7",
      main: "#0288d1",
      dark: "#01579b",
      contrastText: "#ffffff",
    },
    grey: {
      50: "#f6f8f6",
      100: "#ecefec",
      200: "#dbe1db",
      300: "#c2ccc2",
      400: "#94a094",
      500: "#6b776b",
      600: "#505a50",
      700: "#3b433b",
      800: "#262c26",
      900: "#141814",
    },
    background: {
      default: "#f5f8f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1b2419",
      secondary: "#4a544a",
      disabled: "#94a094",
    },
    divider: "#dbe1db",
  },
});


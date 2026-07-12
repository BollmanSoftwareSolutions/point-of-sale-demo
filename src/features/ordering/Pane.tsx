// Shared pane wrapper for the Ordering screen grid columns.

import { Paper } from "@mui/material";

export function Pane({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
    >
      {children}
    </Paper>
  );
}

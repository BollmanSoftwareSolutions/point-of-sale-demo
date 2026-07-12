// Kitchen screen — single pane, 8-slot board.
// See design-docs/03-ui-components.md §4.

import { Box } from "@mui/material";
import { KitchenBoard } from "./KitchenBoard";

export function KitchenScreen() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        p: 1,
        boxSizing: "border-box",
      }}
    >
      <KitchenBoard />
    </Box>
  );
}

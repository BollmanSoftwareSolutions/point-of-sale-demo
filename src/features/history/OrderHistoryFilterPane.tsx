// Left navigation pane — quick filters for the Order History screen.
// See design-docs/03-ui-components.md §3.

import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { OrderStatus } from "../../types";
import type { TimePreset } from "./timePreset";

interface TimePresetDef {
  id: TimePreset;
  label: string;
}

const TIME_PRESETS: TimePresetDef[] = [
  { id: "last4h", label: "Last 4 Hours" },
  { id: "today", label: "Today" },
  { id: "last7d", label: "Last 7 Days" },
];

const STATUSES: OrderStatus[] = ["Kitchen", "Fulfilled", "Refunded"];

const STATUS_COLOR: Record<OrderStatus, "warning" | "success" | "error"> = {
  Kitchen: "warning",
  Fulfilled: "success",
  Refunded: "error",
};

interface OrderHistoryFilterPaneProps {
  activeTimePreset: TimePreset | null;
  activeStatus: OrderStatus | null;
  onTimePreset: (preset: TimePreset) => void;
  onStatus: (status: OrderStatus) => void;
}

export function OrderHistoryFilterPane({
  activeTimePreset,
  activeStatus,
  onTimePreset,
  onStatus,
}: OrderHistoryFilterPaneProps) {
  return (
    <Paper
      variant="outlined"
      component="nav"
      aria-label="Order filters"
      sx={{ p: 1.5, width: 200, flex: "0 0 auto", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="overline" color="text.secondary">
        Time
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {TIME_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            fullWidth
            variant={activeTimePreset === preset.id ? "contained" : "outlined"}
            onClick={() => onTimePreset(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="overline" color="text.secondary">
        Status
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {STATUSES.map((status) => (
          <Button
            key={status}
            fullWidth
            color={STATUS_COLOR[status]}
            variant={activeStatus === status ? "contained" : "outlined"}
            onClick={() => onStatus(status)}
          >
            {status}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}

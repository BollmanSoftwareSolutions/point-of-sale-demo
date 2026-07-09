// Left navigation pane — quick filters for the Order History screen.
// See design-docs/03-ui-components.md §3.

import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import type { OrderStatus } from "../../types";

export type TimePreset = "last4h" | "today" | "last7d";

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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Resolves a quick-filter preset to a { from, to } date range for the orders
// query. Rolling windows use ISO timestamps; "Today" uses the calendar day.
export function timePresetRange(preset: TimePreset): { from: string; to: string } {
  const now = new Date();
  switch (preset) {
    case "last4h":
      return { from: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), to: "" };
    case "today":
      return { from: localDate(now), to: localDate(now) };
    case "last7d":
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), to: "" };
  }
}

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

// PIN input (masked, 4 digits [0-9]).
// See design-docs/03-ui-components.md §1.

import { TextField } from "@mui/material";

export interface PinFieldProps {
  value: string;
  error?: string | null;
  disabled?: boolean;
}

export function PinField({ value, error, disabled }: PinFieldProps) {
  return (
    <TextField
      label="PIN"
      placeholder="Enter PIN"
      type="password"
      value={value}
      error={Boolean(error)}
      helperText={error ?? " "}
      disabled={disabled}
      fullWidth
      autoFocus
      slotProps={{ input: { readOnly: true } }}
      sx={{ "& input": { fontSize: "1.5rem", textAlign: "center", letterSpacing: "0.5em" } }}
    />
  );
}

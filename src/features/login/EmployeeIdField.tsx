// Employee ID input (unmasked, 6 chars [0-9A-D]).
// See design-docs/03-ui-components.md §1.

import { TextField } from "@mui/material";

export interface EmployeeIdFieldProps {
  value: string;
  error?: string | null;
  disabled?: boolean;
}

export function EmployeeIdField({ value, error, disabled }: EmployeeIdFieldProps) {
  return (
    <TextField
      label="Employee ID"
      placeholder="Enter employee ID"
      value={value}
      error={Boolean(error)}
      helperText={error ?? " "}
      disabled={disabled}
      fullWidth
      slotProps={{ input: { readOnly: true } }}
      sx={{ "& input": { fontSize: "1.5rem", textAlign: "center", letterSpacing: "0.3em" } }}
    />
  );
}

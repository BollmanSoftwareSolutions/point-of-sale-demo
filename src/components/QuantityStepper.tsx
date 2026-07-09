// +/- quantity control for a line item (Pane 3).
// See design-docs/03-ui-components.md (Shared Components).

import { Box, IconButton, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

export interface QuantityStepperProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <IconButton
        aria-label="Decrease quantity"
        color="primary"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={disabled || quantity <= min}
      >
        <RemoveIcon />
      </IconButton>
      <Typography
        component="span"
        aria-label="Quantity"
        sx={{ minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: "1.25rem" }}
      >
        {quantity}
      </Typography>
      <IconButton
        aria-label="Increase quantity"
        color="primary"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}

// Renders integer cents as "$0.00".
// See design-docs/03-ui-components.md (Shared Components).

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { formatMoney } from "../lib/money";

interface MoneyProps {
  cents: number;
  sx?: SxProps<Theme>;
}

export function Money({ cents, sx }: MoneyProps) {
  return (
    <Box
      component="span"
      sx={[
        { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {formatMoney(cents)}
    </Box>
  );
}

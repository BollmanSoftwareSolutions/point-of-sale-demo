// Kitchen order card — order # + details (no prices) + Completed.
// See design-docs/03-ui-components.md §4.

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useOrder } from "../../queries/useOrder";
import { useUpdateOrderStatus } from "../../queries/useUpdateOrderStatus";
import { useInterval } from "../../lib/useInterval";
import type { Order } from "../../types";

interface KitchenOrderCardProps {
  orderId: string;
}

// Number of detail lines shown at once before overflow auto-scrolls.
const VISIBLE_LINES = 8;
const SCROLL_INTERVAL_MS = 10_000;

interface DisplayLine {
  key: string;
  text: string;
  kind: "item" | "modifier";
}

function buildLines(order: Order): DisplayLine[] {
  const lines: DisplayLine[] = [];
  for (const li of order.lineItems) {
    const prefix = li.quantity > 1 ? `${li.quantity}× ` : "";
    lines.push({ key: li.id, text: `${prefix}${li.displayName}`, kind: "item" });
    for (let i = 0; i < li.appliedModifiers.length; i++) {
      lines.push({
        key: `${li.id}-m${i}`,
        text: li.appliedModifiers[i].name,
        kind: "modifier",
      });
    }
  }
  return lines;
}

export function KitchenOrderCard({ orderId }: KitchenOrderCardProps) {
  const { data: order, isLoading, isError } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const lines = useMemo(() => (order ? buildLines(order) : []), [order]);
  const overflow = lines.length > VISIBLE_LINES;

  const [offset, setOffset] = useState(0);

  // Advance the visible window one line every 10s, wrapping around.
  useInterval(
    () => setOffset((prev) => (prev + 1) % lines.length),
    overflow ? SCROLL_INTERVAL_MS : null,
  );

  const windowLines = overflow
    ? Array.from({ length: VISIBLE_LINES }, (_, i) => lines[(offset + i) % lines.length])
    : lines;

  function handleComplete() {
    updateStatus.mutate({ id: orderId, status: "Fulfilled" });
  }

  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
          #{orderId}
        </Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ flex: 1, overflow: "hidden", minHeight: 0, py: 1 }}>
        {isLoading && (
          <Stack spacing={0.75}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={`${80 - i * 10}%`} />
            ))}
          </Stack>
        )}

        {isError && (
          <Alert severity="error" variant="outlined">
            Failed to load order details.
          </Alert>
        )}

        {order && (
          <Box>
            {windowLines.map((line) => (
              <Typography
                key={line.key}
                variant={line.kind === "item" ? "body1" : "body2"}
                sx={{
                  pl: line.kind === "modifier" ? 2 : 0,
                  fontWeight: line.kind === "item" ? 600 : 400,
                  color: line.kind === "modifier" ? "text.secondary" : "text.primary",
                  lineHeight: 1.4,
                }}
              >
                {line.kind === "modifier" ? `• ${line.text}` : line.text}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ p: 1.5, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleComplete}
          disabled={updateStatus.isPending || !order}
        >
          {updateStatus.isPending ? "Completing…" : "Completed"}
        </Button>
      </CardActions>
    </Card>
  );
}

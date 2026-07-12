// Kitchen board — up to 8 cards + queue/reflow logic.
// See design-docs/03-ui-components.md §4.

import { Box, Paper, Typography } from "@mui/material";
import { useKitchenOrders } from "../../queries/useKitchenOrders";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { KitchenOrderCard } from "./KitchenOrderCard";

const MAX_VISIBLE = 8;

export function KitchenBoard() {
  const { data, isLoading, isError, refetch } = useKitchenOrders();

  if (isLoading) return <LoadingState rows={4} />;
  if (isError) {
    return (
      <ErrorState
        title="Failed to load kitchen orders"
        message="The kitchen board could not be refreshed."
        onRetry={() => refetch()}
      />
    );
  }

  // Oldest → newest (build order). Only the first 8 are shown; the remainder is
  // a visual queue that advances automatically as visible orders are completed
  // (completing an order removes it from this list and the rest reflow).
  const visible = (data?.results ?? []).slice(0, MAX_VISIBLE);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: 1,
      }}
    >
      {Array.from({ length: MAX_VISIBLE }).map((_, slot) => {
        const order = visible[slot];
        if (order) {
          return <KitchenOrderCard key={order.id} orderId={order.id} />;
        }
        return (
          <Paper
            key={`empty-${slot}`}
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderStyle: "dashed",
              color: "text.disabled",
              minHeight: 0,
            }}
          >
            <Typography variant="body2">Empty</Typography>
          </Paper>
        );
      })}
    </Box>
  );
}

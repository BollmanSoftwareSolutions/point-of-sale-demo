// Order History screen — search + results grid / detail panel.
// See design-docs/03-ui-components.md §3.

import { useState } from "react";
import { Box } from "@mui/material";
import { OrderSearchBar, emptyFilters } from "./OrderSearchBar";
import type { HistoryFilters } from "./OrderSearchBar";
import { OrderHistoryGrid } from "./OrderHistoryGrid";
import { OrderDetailPanel } from "./OrderDetailPanel";

export function OrderHistoryScreen() {
  const [filters, setFilters] = useState<HistoryFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleFiltersChange(next: HistoryFilters) {
    setFilters(next);
    setPage(0); // reset to first page whenever the search changes
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <OrderSearchBar filters={filters} onChange={handleFiltersChange} />

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {selectedId ? (
          <OrderDetailPanel orderId={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <OrderHistoryGrid
            filters={filters}
            page={page}
            onPageChange={setPage}
            onSelect={setSelectedId}
          />
        )}
      </Box>
    </Box>
  );
}

// Order History screen — search + results grid / detail panel.
// See design-docs/03-ui-components.md §3.

import { useState } from "react";
import { Box } from "@mui/material";
import { OrderSearchBar, emptyFilters } from "./OrderSearchBar";
import type { HistoryFilters } from "./OrderSearchBar";
import { OrderHistoryFilterPane } from "./OrderHistoryFilterPane";
import { timePresetRange } from "./timePreset";
import type { TimePreset } from "./timePreset";
import { OrderHistoryGrid } from "./OrderHistoryGrid";
import { OrderDetailPanel } from "./OrderDetailPanel";
import type { OrderStatus } from "../../types";

export function OrderHistoryScreen() {
  const [filters, setFilters] = useState<HistoryFilters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTimePreset, setActiveTimePreset] = useState<TimePreset | null>(null);

  function applyFilters(next: HistoryFilters) {
    setFilters(next);
    setPage(0); // reset to first page whenever the search changes
    setSelectedId(null); // return to the results grid
  }

  // Manual search-bar edits clear any active quick time preset.
  function handleSearchBarChange(next: HistoryFilters) {
    if (next.from !== filters.from || next.to !== filters.to) {
      setActiveTimePreset(null);
    }
    applyFilters(next);
  }

  function handleTimePreset(preset: TimePreset) {
    if (activeTimePreset === preset) {
      setActiveTimePreset(null);
      applyFilters({ ...filters, from: "", to: "" });
      return;
    }
    setActiveTimePreset(preset);
    const { from, to } = timePresetRange(preset);
    applyFilters({ ...filters, from, to });
  }

  function handleStatus(status: OrderStatus) {
    const next = filters.status === status ? undefined : status;
    applyFilters({ ...filters, status: next });
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        boxSizing: "border-box",
      }}
    >
      <OrderSearchBar filters={filters} onChange={handleSearchBarChange} />

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: 1 }}>
        <OrderHistoryFilterPane
          activeTimePreset={activeTimePreset}
          activeStatus={filters.status ?? null}
          onTimePreset={handleTimePreset}
          onStatus={handleStatus}
        />

        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
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
    </Box>
  );
}

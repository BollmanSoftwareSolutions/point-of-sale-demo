// Search bar — text input + date range.
// See design-docs/03-ui-components.md §3.

import { Box, IconButton, InputAdornment, Paper, TextField, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import type { OrderStatus } from "../../types";

export interface HistoryFilters {
  q: string;
  from: string; // ISO date/datetime (inclusive) or ""
  to: string; // ISO date/datetime (inclusive) or ""
  status?: OrderStatus; // set by the quick-filter pane
}

export const emptyFilters: HistoryFilters = { q: "", from: "", to: "" };

interface OrderSearchBarProps {
  filters: HistoryFilters;
  onChange: (next: HistoryFilters) => void;
}

export function OrderSearchBar({ filters, onChange }: OrderSearchBarProps) {
  const hasFilters = Boolean(filters.q || filters.from || filters.to || filters.status);

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          label="Search"
          placeholder="Order # or item name"
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          size="small"
          sx={{ flex: "1 1 240px", minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="From"
          type="date"
          value={filters.from.slice(0, 10)}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: "0 0 auto" }}
        />

        <TextField
          label="To"
          type="date"
          value={filters.to.slice(0, 10)}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: "0 0 auto" }}
        />

        <Tooltip title="Clear filters">
          <span>
            <IconButton
              aria-label="Clear filters"
              onClick={() => onChange(emptyFilters)}
              disabled={!hasFilters}
            >
              <ClearIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}

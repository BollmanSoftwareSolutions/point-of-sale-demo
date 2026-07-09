// Results grid — Order #, Date, Status, Items (10 rows, paginated).
// See design-docs/03-ui-components.md §3.

import { useLayoutEffect, useRef, useState } from "react";
import { Box, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useOrders } from "../../queries/useOrders";
import { ErrorState } from "../../components/ErrorState";
import type { OrderSummaryRow } from "../../api/orders";
import type { OrderStatus } from "../../types";
import type { HistoryFilters } from "./OrderSearchBar";

const PAGE_SIZE = 10;
// Approximate chrome around the rows; used to size rows so 10 fill the height.
const HEADER_HEIGHT = 56;
const FOOTER_HEIGHT = 53;
const MIN_ROW_HEIGHT = 36;

interface OrderHistoryGridProps {
  filters: HistoryFilters;
  page: number; // 0-based (DataGrid convention)
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
}

const STATUS_COLOR: Record<OrderStatus, "warning" | "success" | "error"> = {
  Kitchen: "warning",
  Fulfilled: "success",
  Refunded: "error",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min}`;
}

const columns: GridColDef<OrderSummaryRow>[] = [
  { field: "id", headerName: "Order #", width: 110 },
  {
    field: "createdAt",
    headerName: "Date",
    width: 150,
    valueFormatter: (value: string) => formatDateTime(value),
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: (params: GridRenderCellParams<OrderSummaryRow, OrderStatus>) => (
      <Chip label={params.value} color={STATUS_COLOR[params.value!]} size="small" />
    ),
  },
  {
    field: "itemsPreview",
    headerName: "Items",
    flex: 1,
    minWidth: 200,
    sortable: false,
    renderCell: (params: GridRenderCellParams<OrderSummaryRow, string>) => (
      <Box
        title={params.value ?? ""}
        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {params.value}
      </Box>
    ),
  },
];

export function OrderHistoryGrid({ filters, page, onPageChange, onSelect }: OrderHistoryGridProps) {
  const { data, isLoading, isError, isFetching, refetch } = useOrders({
    q: filters.q || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: page + 1, // API is 1-based
    pageSize: PAGE_SIZE,
  });

  // Size rows so exactly PAGE_SIZE of them fill the available vertical space.
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(52);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
      setRowHeight(Math.max(MIN_ROW_HEIGHT, Math.floor(available / PAGE_SIZE)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load orders"
        message="The order history could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Box ref={containerRef} sx={{ flex: 1, minHeight: 0, width: "100%" }}>
      <DataGrid
        rows={data?.results ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={data?.total ?? 0}
        loading={isLoading || isFetching}
        columnHeaderHeight={HEADER_HEIGHT}
        rowHeight={rowHeight}
        paginationMode="server"
        paginationModel={{ page, pageSize: PAGE_SIZE }}
        onPaginationModelChange={(model) => onPageChange(model.page)}
        pageSizeOptions={[PAGE_SIZE]}
        disableColumnMenu
        disableRowSelectionOnClick
        onRowClick={(params) => onSelect(String(params.id))}
        sx={{
          height: "100%",
          "& .MuiDataGrid-row": { cursor: "pointer" },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
        }}
      />
    </Box>
  );
}

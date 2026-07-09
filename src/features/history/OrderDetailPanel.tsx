// Order detail panel — summary + payments + Refund.
// See design-docs/03-ui-components.md §3.

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useOrder } from "../../queries/useOrder";
import { useUpdateOrderStatus } from "../../queries/useUpdateOrderStatus";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Money } from "../../components/Money";
import type { OrderStatus, PaymentMethod } from "../../types";

interface OrderDetailPanelProps {
  orderId: string;
  onBack: () => void;
}

const STATUS_COLOR: Record<OrderStatus, "warning" | "success" | "error"> = {
  Kitchen: "warning",
  Fulfilled: "success",
  Refunded: "error",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  Card: "Card",
  Cash: "Cash",
  GiftCertificate: "Gift Certificate",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function OrderDetailPanel({ orderId, onBack }: OrderDetailPanelProps) {
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const backButton = (
    <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
      Back to results
    </Button>
  );

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {backButton}
        <LoadingState rows={5} />
      </Stack>
    );
  }

  if (isError || !order) {
    return (
      <Stack spacing={2}>
        {backButton}
        <ErrorState
          title="Failed to load order"
          message={`Order #${orderId} could not be loaded.`}
          onRetry={() => refetch()}
        />
      </Stack>
    );
  }

  const alreadyRefunded = order.status === "Refunded";

  function handleRefund() {
    updateStatus.mutate({ id: order!.id, status: "Refunded" });
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, minHeight: 0, flex: 1 }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton aria-label="Back to results" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Order #{order.id}
        </Typography>
        <Chip label={order.status} color={STATUS_COLOR[order.status]} size="small" />
        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {formatDateTime(order.createdAt)}
        </Typography>
      </Box>

      <Divider />

      {/* Line items */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Stack spacing={1.5}>
          {order.lineItems.map((li) => (
            <Box key={li.id}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {li.quantity > 1 ? `${li.quantity}× ` : ""}
                  {li.displayName}
                </Typography>
                <Money cents={li.lineTotalCents} sx={{ fontWeight: 600 }} />
              </Box>
              {li.appliedModifiers.map((mod, i) => (
                <Box
                  key={`${li.id}-m${i}`}
                  sx={{ display: "flex", justifyContent: "space-between", gap: 2, pl: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {mod.name}
                  </Typography>
                  {mod.priceModifierCents !== 0 && (
                    <Money
                      cents={mod.priceModifierCents}
                      sx={{ color: "text.secondary", fontSize: "0.875rem" }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Totals */}
      <Stack spacing={0.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Money cents={order.subtotalCents} sx={{ color: "text.secondary" }} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Money cents={order.totalCents} sx={{ fontWeight: 700, fontSize: "1.25rem" }} />
        </Box>
      </Stack>

      <Divider />

      {/* Payments */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Payments
        </Typography>
        <Stack spacing={0.5}>
          {order.payments.map((p) => (
            <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography>{PAYMENT_LABEL[p.method]}</Typography>
              <Money cents={p.amountCents} />
            </Box>
          ))}
        </Stack>
      </Box>

      {updateStatus.isError && (
        <Alert severity="error" variant="outlined">
          Refund failed. Please try again.
        </Alert>
      )}

      {/* Refund action */}
      <Button
        variant="contained"
        color="error"
        onClick={handleRefund}
        disabled={alreadyRefunded || updateStatus.isPending}
      >
        {alreadyRefunded
          ? "Refunded"
          : updateStatus.isPending
            ? "Refunding…"
            : "Refund"}
      </Button>
    </Paper>
  );
}

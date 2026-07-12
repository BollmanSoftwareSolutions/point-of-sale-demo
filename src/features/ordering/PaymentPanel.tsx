// Panes 2 & 3 (payment mode) — running balance + payment method, then number pad.
// See design-docs/03-ui-components.md §2.

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Pane } from "./Pane";
import { NumberPad } from "../../components/NumberPad";
import { Money } from "../../components/Money";
import { useCartStore } from "../../stores/cartStore";
import { useCreateOrder } from "../../queries/useCreateOrder";
import { useAuthStore } from "../../stores/authStore";
import type { CreateOrderRequest } from "../../api/orders";
import type { PaymentMethod } from "../../types";

interface PaymentPanelProps {
  onBack: () => void;
  onCompleted: () => void;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "Card", label: "Card" },
  { value: "Cash", label: "Cash" },
  { value: "GiftCertificate", label: "Gift Certificate" },
];

const MAX_ENTRY_DIGITS = 7; // up to $99,999.99

export function PaymentPanel({ onBack, onCompleted }: PaymentPanelProps) {
  const lineItems = useCartStore((s) => s.lineItems);
  const payments = useCartStore((s) => s.payments);
  const totalCents = useCartStore((s) => s.totalCents);
  const paidCents = useCartStore((s) => s.paidCents);
  const remainingCents = useCartStore((s) => s.remainingCents);
  const isFullyPaid = useCartStore((s) => s.isFullyPaid);
  const addPayment = useCartStore((s) => s.addPayment);
  const clear = useCartStore((s) => s.clear);

  const employeeId = useAuthStore((s) => s.employee?.id);
  const createOrder = useCreateOrder();

  const [method, setMethod] = useState<PaymentMethod>("Card");
  const [entry, setEntry] = useState("");

  const entryCents = entry ? Number(entry) : 0;

  function handleKey(value: string) {
    setEntry((prev) => {
      const next = (prev + value).replace(/^0+(?=\d)/, "");
      if (next.length > MAX_ENTRY_DIGITS) return prev;
      // Cap the entry at the remaining balance to prevent overpayment.
      if (Number(next) > remainingCents) return String(remainingCents);
      return next;
    });
  }

  function handleBackspace() {
    setEntry((prev) => prev.slice(0, -1));
  }

  function handleSubmitPayment() {
    // Never accept more than the outstanding balance.
    const amountCents = Math.min(entryCents, remainingCents);
    if (amountCents <= 0) return;
    addPayment({
      id: crypto.randomUUID(),
      method,
      amountCents,
      createdAt: new Date().toISOString(),
    });
    setEntry("");
  }

  function handleCompleteOrder() {
    const request: CreateOrderRequest = {
      employeeId: employeeId ?? "",
      lineItems: lineItems.map((li) => ({
        menuItemId: li.menuItemId,
        quantity: li.quantity,
        selectedSizeId: li.selectedSizeId,
        selectedOptionIds: li.selectedOptionIds,
        selectedModifierIds: li.selectedModifierIds,
      })),
      payments: payments.map((p) => ({ method: p.method, amountCents: p.amountCents })),
    };
    createOrder.mutate(request, {
      onSuccess: () => {
        clear();
        onCompleted();
      },
    });
  }

  return (
    <>
      {/* Pane 2 — running balance + payment method */}
      <Pane>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} disabled={createOrder.isPending}>
            Back
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            Payment
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
          {/* Running balance */}
          <Stack spacing={0.75}>
            <Balance label="Total" cents={totalCents} bold />
            <Balance label="Paid" cents={paidCents} />
            <Balance label="Remaining" cents={remainingCents} bold color="primary.main" />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Payment method */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Payment Method
          </Typography>
          <ToggleButtonGroup
            exclusive
            orientation="vertical"
            fullWidth
            value={method}
            onChange={(_, value: PaymentMethod | null) => value && setMethod(value)}
          >
            {METHODS.map((m) => (
              <ToggleButton key={m.value} value={m.value} sx={{ textTransform: "none" }}>
                {m.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Pane>

      {/* Pane 3 — amount entry, number pad, complete order */}
      <Pane>
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
          {/* Amount entry */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "baseline",
              px: 2,
              py: 1.5,
              mb: 1.5,
              borderRadius: 1,
              bgcolor: "grey.100",
            }}
          >
            <Money cents={entryCents} sx={{ fontSize: "2rem", fontWeight: 700 }} />
          </Box>
          <NumberPad onKey={handleKey} onBackspace={handleBackspace} />

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleSubmitPayment}
            disabled={entryCents <= 0}
            sx={{ mt: 2 }}
          >
            Submit Payment
          </Button>

          {createOrder.isError && (
            <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
              Could not complete the order. Please try again.
            </Alert>
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            color="success"
            onClick={handleCompleteOrder}
            disabled={!isFullyPaid || createOrder.isPending}
          >
            {createOrder.isPending ? "Completing…" : "Complete Order"}
          </Button>
        </Box>
      </Pane>
    </>
  );
}

function Balance({
  label,
  cents,
  bold = false,
  color,
}: {
  label: string;
  cents: number;
  bold?: boolean;
  color?: string;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography sx={{ fontWeight: bold ? 700 : 400, color }}>{label}</Typography>
      <Money cents={cents} sx={{ fontWeight: bold ? 700 : 400, color }} />
    </Box>
  );
}

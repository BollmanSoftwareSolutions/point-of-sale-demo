// Pane 4 — order summary.
// See design-docs/03-ui-components.md §2.

import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Money } from "../../components/Money";
import { useCartStore } from "../../stores/cartStore";

interface OrderSummaryProps {
  onGoToPayment: () => void;
}

export function OrderSummary({ onGoToPayment }: OrderSummaryProps) {
  const lineItems = useCartStore((s) => s.lineItems);
  const subtotalCents = useCartStore((s) => s.subtotalCents);
  const totalCents = useCartStore((s) => s.totalCents);
  const removeLineItem = useCartStore((s) => s.removeLineItem);

  const isEmpty = lineItems.length === 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Order Summary
        </Typography>
      </Box>
      <Divider sx={{ mt: 1.5 }} />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, py: 1.5 }}>
        {isEmpty ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            No items yet. Build an order from the menu.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {lineItems.map((li) => (
              <Box key={li.id}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, flex: 1 }}>
                    {li.quantity > 1 ? `${li.quantity}× ` : ""}
                    {li.displayName}
                  </Typography>
                  <Money cents={li.lineTotalCents} sx={{ fontWeight: 600 }} />
                  <IconButton
                    size="small"
                    aria-label={`Remove ${li.displayName}`}
                    onClick={() => removeLineItem(li.id)}
                    sx={{ mt: -0.5 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
                {li.appliedModifiers.map((mod, i) => (
                  <Box
                    key={`${li.id}-m${i}`}
                    sx={{ display: "flex", justifyContent: "space-between", gap: 2, pl: 2, pr: 5 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {mod.name}
                    </Typography>
                    {mod.priceModifierCents !== 0 && (
                      <Money
                        cents={mod.priceModifierCents}
                        sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />
      <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Money cents={subtotalCents} sx={{ color: "text.secondary" }} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Money cents={totalCents} sx={{ fontWeight: 700, fontSize: "1.25rem" }} />
        </Box>
      </Stack>

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onGoToPayment}
          disabled={isEmpty}
        >
          Go to Payment
        </Button>
      </Box>
    </Box>
  );
}

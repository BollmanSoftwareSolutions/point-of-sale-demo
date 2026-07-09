// Ordering screen — 4 vertical panes + footer.
// See design-docs/03-ui-components.md §2.

import { useState } from "react";
import { Box, Paper } from "@mui/material";
import { useMenu } from "../../queries/useMenu";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { CategoryList } from "./CategoryList";
import { CategoryItemList } from "./CategoryItemList";
import { ItemConfigurator } from "./ItemConfigurator";
import { OrderSummary } from "./OrderSummary";
import { PaymentPanel } from "./PaymentPanel";

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
    >
      {children}
    </Paper>
  );
}

export function OrderingScreen() {
  const { data: menu, isLoading, isError, refetch } = useMenu();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeCategoryItemId, setActiveCategoryItemId] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ flex: 1, p: 2 }}>
        <LoadingState rows={6} />
      </Box>
    );
  }

  if (isError || !menu) {
    return (
      <Box sx={{ flex: 1, p: 2 }}>
        <ErrorState
          title="Failed to load menu"
          message="The menu could not be loaded."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  const categories = menu.categories;
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];
  const categoryItems = activeCategory?.items ?? [];
  const activeCategoryItem =
    categoryItems.find((ci) => ci.id === activeCategoryItemId) ?? null;

  function handleSelectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setActiveCategoryItemId(null);
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr 2.4fr 1.8fr",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Pane 1 — categories */}
      <Pane>
        <Box sx={{ overflow: "auto", p: 1.5 }}>
          <CategoryList
            categories={categories}
            selectedId={activeCategory?.id}
            onSelect={handleSelectCategory}
          />
        </Box>
      </Pane>

      {/* Pane 2 — category items */}
      <Pane>
        <Box sx={{ overflow: "auto", p: 1.5 }}>
          <CategoryItemList
            items={categoryItems}
            selectedId={activeCategoryItemId}
            onSelect={setActiveCategoryItemId}
          />
        </Box>
      </Pane>

      {/* Pane 3 — configurator or payment */}
      <Pane>
        {paymentMode ? (
          <PaymentPanel
            onBack={() => setPaymentMode(false)}
            onCompleted={() => setPaymentMode(false)}
          />
        ) : (
          <ItemConfigurator categoryItem={activeCategoryItem} />
        )}
      </Pane>

      {/* Pane 4 — order summary */}
      <Pane>
        <OrderSummary onGoToPayment={() => setPaymentMode(true)} />
      </Pane>
    </Box>
  );
}

// Pane 3 (build mode) — item + modifiers configurator.
// See design-docs/03-ui-components.md §2.

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Money } from "../../components/Money";
import { QuantityStepper } from "../../components/QuantityStepper";
import { buildLineItem, computeUnitPriceCents } from "../../lib/pricing";
import { useCartStore } from "../../stores/cartStore";
import type { CategoryItem, MenuItem } from "../../types";

interface ItemConfiguratorProps {
  categoryItem: CategoryItem | null;
}

// Per-product selection: one size, one option group value, many modifiers.
interface ItemSelection {
  selectedSizeId?: string;
  selectedOptionId?: string;
  selectedModifierIds: string[];
}

function defaultSelection(item: MenuItem): ItemSelection {
  const defaultSize = item.sizes.find((s) => s.isDefault) ?? item.sizes[0];
  const defaultOption = item.options.find((o) => o.isDefault) ?? item.options[0];
  return {
    selectedSizeId: defaultSize?.id,
    selectedOptionId: defaultOption?.id,
    selectedModifierIds: item.modifiers.filter((m) => m.defaultSelected).map((m) => m.id),
  };
}

function buildDefaults(categoryItem: CategoryItem | null): Record<string, ItemSelection> {
  const selections: Record<string, ItemSelection> = {};
  if (categoryItem) {
    for (const item of categoryItem.items) {
      selections[item.id] = defaultSelection(item);
    }
  }
  return selections;
}

export function ItemConfigurator({ categoryItem }: ItemConfiguratorProps) {
  const addLineItem = useCartStore((s) => s.addLineItem);

  const [selections, setSelections] = useState<Record<string, ItemSelection>>(() =>
    buildDefaults(categoryItem),
  );
  const [quantity, setQuantity] = useState(1);

  // Reset all selections + quantity whenever a different item is chosen.
  useEffect(() => {
    setSelections(buildDefaults(categoryItem));
    setQuantity(1);
  }, [categoryItem]);

  const previewUnitCents = useMemo(() => {
    if (!categoryItem) return 0;
    return categoryItem.items.reduce((sum, item) => {
      const sel = selections[item.id] ?? defaultSelection(item);
      return (
        sum +
        computeUnitPriceCents(item, {
          selectedSizeId: sel.selectedSizeId,
          selectedOptionIds: sel.selectedOptionId ? [sel.selectedOptionId] : [],
          selectedModifierIds: sel.selectedModifierIds,
        })
      );
    }, 0);
  }, [categoryItem, selections]);

  if (!categoryItem) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body1">Select an item to configure.</Typography>
      </Box>
    );
  }

  function updateSelection(itemId: string, patch: Partial<ItemSelection>) {
    setSelections((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  }

  function toggleModifier(itemId: string, modifierId: string) {
    setSelections((prev) => {
      const current = prev[itemId];
      const has = current.selectedModifierIds.includes(modifierId);
      const selectedModifierIds = has
        ? current.selectedModifierIds.filter((id) => id !== modifierId)
        : [...current.selectedModifierIds, modifierId];
      return { ...prev, [itemId]: { ...current, selectedModifierIds } };
    });
  }

  function handleAddToOrder() {
    for (const item of categoryItem!.items) {
      const sel = selections[item.id] ?? defaultSelection(item);
      addLineItem(
        buildLineItem(item, {
          selectedSizeId: sel.selectedSizeId,
          selectedOptionIds: sel.selectedOptionId ? [sel.selectedOptionId] : [],
          selectedModifierIds: sel.selectedModifierIds,
          quantity,
        }),
      );
    }
    // Reset for the next build of the same item.
    setSelections(buildDefaults(categoryItem));
    setQuantity(1);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", p: 2 }}>
        <Stack spacing={3} divider={<Divider flexItem />}>
          {categoryItem.items.map((item) => {
            const sel = selections[item.id] ?? defaultSelection(item);
            return (
              <Box key={item.id}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {item.displayName}
                </Typography>

                {item.sizes.length > 0 && (
                  <Section title="Size">
                    <ToggleButtonGroup
                      exclusive
                      value={sel.selectedSizeId ?? null}
                      onChange={(_, value: string | null) => {
                        if (value) updateSelection(item.id, { selectedSizeId: value });
                      }}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {item.sizes.map((size) => (
                        <ToggleButton key={size.id} value={size.id} sx={CHOICE_SX}>
                          <span>{size.name}</span>
                          {size.priceModifierCents !== 0 && (
                            <Money cents={size.priceModifierCents} sx={DELTA_SX} />
                          )}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Section>
                )}

                {item.options.length > 0 && (
                  <Section title="Options">
                    <ToggleButtonGroup
                      exclusive
                      value={sel.selectedOptionId ?? null}
                      onChange={(_, value: string | null) => {
                        if (value) updateSelection(item.id, { selectedOptionId: value });
                      }}
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {item.options.map((option) => (
                        <ToggleButton key={option.id} value={option.id} sx={CHOICE_SX}>
                          <span>{option.name}</span>
                          {option.priceModifierCents !== 0 && (
                            <Money cents={option.priceModifierCents} sx={DELTA_SX} />
                          )}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Section>
                )}

                {item.modifiers.length > 0 && (
                  <Section title="Modifiers">
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {item.modifiers.map((modifier) => {
                        const selected = sel.selectedModifierIds.includes(modifier.id);
                        return (
                          <ToggleButton
                            key={modifier.id}
                            value={modifier.id}
                            selected={selected}
                            onChange={() => toggleModifier(item.id, modifier.id)}
                            sx={CHOICE_SX}
                          >
                            <span>{modifier.name}</span>
                            {modifier.priceModifierCents !== 0 && (
                              <Money cents={modifier.priceModifierCents} sx={DELTA_SX} />
                            )}
                          </ToggleButton>
                        );
                      })}
                    </Box>
                  </Section>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider />
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <QuantityStepper quantity={quantity} onChange={setQuantity} />
        <Button variant="contained" size="large" onClick={handleAddToOrder} sx={{ flex: 1 }}>
          Add to Order
          <Money cents={previewUnitCents * quantity} sx={{ ml: 1, fontWeight: 700 }} />
        </Button>
      </Box>
    </Box>
  );
}

const CHOICE_SX = {
  textTransform: "none",
  gap: 0.75,
  px: 2,
  minHeight: 48,
} as const;

const DELTA_SX = { fontSize: "0.8rem", opacity: 0.8 } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

// Line-item price computation.
// See design-docs/02-data-models.md (Line item price formula).

import type { AppliedModifier, MenuItem, OrderLineItem } from "../types";

export interface LineSelection {
  selectedSizeId?: string;
  selectedOptionIds: string[];
  selectedModifierIds: string[];
}

// unitPriceCents = base + size + sum(options) + sum(modifiers)
export function computeUnitPriceCents(item: MenuItem, selection: LineSelection): number {
  let cents = item.basePriceCents;

  if (selection.selectedSizeId) {
    const size = item.sizes.find((s) => s.id === selection.selectedSizeId);
    if (size) cents += size.priceModifierCents;
  }

  for (const optionId of selection.selectedOptionIds) {
    const option = item.options.find((o) => o.id === optionId);
    if (option) cents += option.priceModifierCents;
  }

  for (const modifierId of selection.selectedModifierIds) {
    const modifier = item.modifiers.find((m) => m.id === modifierId);
    if (modifier) cents += modifier.priceModifierCents;
  }

  return cents;
}

// Snapshot of the selected modifiers for display/receipt (mirrors the mock API).
export function buildAppliedModifiers(
  item: MenuItem,
  selectedModifierIds: string[],
): AppliedModifier[] {
  const applied: AppliedModifier[] = [];
  for (const modifierId of selectedModifierIds) {
    const modifier = item.modifiers.find((m) => m.id === modifierId);
    if (modifier) {
      applied.push({ name: modifier.name, priceModifierCents: modifier.priceModifierCents });
    }
  }
  return applied;
}

// Build a cart line item from a configurable product + the user's selections.
export function buildLineItem(
  item: MenuItem,
  selection: LineSelection & { quantity: number },
): OrderLineItem {
  const quantity = selection.quantity > 0 ? selection.quantity : 1;
  const unitPriceCents = computeUnitPriceCents(item, selection);
  return {
    id: crypto.randomUUID(),
    menuItemId: item.id,
    displayName: item.displayName,
    quantity,
    selectedSizeId: selection.selectedSizeId,
    selectedOptionIds: selection.selectedOptionIds,
    selectedModifierIds: selection.selectedModifierIds,
    appliedModifiers: buildAppliedModifiers(item, selection.selectedModifierIds),
    unitPriceCents,
    lineTotalCents: unitPriceCents * quantity,
  };
}

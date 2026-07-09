// Domain types for orders and payments.
// See design-docs/02-data-models.md §3 & §4.

export type OrderStatus = "Kitchen" | "Fulfilled" | "Refunded";

export interface Order {
  id: string; // Human-friendly, e.g. "1042"
  employeeId: string; // Cashier who created it
  createdAt: string; // ISO-8601
  status: OrderStatus;
  lineItems: OrderLineItem[];
  payments: Payment[];
  subtotalCents: number; // Sum of line item totals
  totalCents: number; // Final amount owed (== subtotal for demo)
}

export interface OrderLineItem {
  id: string; // Line id (unique within order)
  menuItemId: string; // Source MenuItem
  displayName: string; // Snapshot of name at time of order
  quantity: number; // Default 1
  selectedSizeId?: string; // Chosen MenuChoice, if the item has sizes
  selectedOptionIds: string[]; // Chosen MenuOptions
  selectedModifierIds: string[]; // Chosen MenuModifiers (adds/removes)
  appliedModifiers: AppliedModifier[]; // Snapshot for display/receipt
  unitPriceCents: number; // base + size + options + modifiers
  lineTotalCents: number; // unitPriceCents * quantity
}

// Frozen snapshot so historical orders render correctly even if the menu changes
export interface AppliedModifier {
  name: string; // e.g. "Add Pickles", "No Cheese"
  priceModifierCents: number; // e.g. +10, -50
}

export type PaymentMethod = "Card" | "Cash" | "GiftCertificate";

export interface Payment {
  id: string;
  method: PaymentMethod;
  amountCents: number; // Entered as whole cents (no decimal key)
  createdAt: string; // ISO-8601
}

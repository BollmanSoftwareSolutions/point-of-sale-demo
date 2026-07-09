// Zustand cart store (in-progress order being built on the Ordering screen).
// See design-docs/05-state-and-routing.md §2 (cartStore).

import type { OrderLineItem, Payment } from "../types";

export interface CartState {
  lineItems: OrderLineItem[];
  payments: Payment[];
  // derived selectors
  subtotalCents: number;
  totalCents: number;
  paidCents: number;
  remainingCents: number;
  isFullyPaid: boolean;

  addLineItem: (item: OrderLineItem) => void;
  updateLineItemQuantity: (lineId: string, qty: number) => void;
  removeLineItem: (lineId: string) => void;
  addPayment: (payment: Payment) => void;
  removePayment: (paymentId: string) => void;
  clear: () => void;
}

// TODO: implement with create<CartState>()(...)

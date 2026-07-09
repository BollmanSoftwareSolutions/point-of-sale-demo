// Zustand cart store (in-progress order being built on the Ordering screen).
// See design-docs/05-state-and-routing.md §2 (cartStore).

import { create } from "zustand";
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

interface Derived {
  subtotalCents: number;
  totalCents: number;
  paidCents: number;
  remainingCents: number;
  isFullyPaid: boolean;
}

// Recompute all derived totals from the current line items + payments.
function derive(lineItems: OrderLineItem[], payments: Payment[]): Derived {
  const subtotalCents = lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0);
  const totalCents = subtotalCents; // == subtotal for the demo
  const paidCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const remainingCents = Math.max(totalCents - paidCents, 0);
  const isFullyPaid = lineItems.length > 0 && paidCents >= totalCents;
  return { subtotalCents, totalCents, paidCents, remainingCents, isFullyPaid };
}

export const useCartStore = create<CartState>((set) => ({
  lineItems: [],
  payments: [],
  ...derive([], []),

  addLineItem: (item) =>
    set((state) => {
      const lineItems = [...state.lineItems, item];
      return { lineItems, ...derive(lineItems, state.payments) };
    }),

  updateLineItemQuantity: (lineId, qty) =>
    set((state) => {
      const lineItems = state.lineItems
        .map((li) =>
          li.id === lineId
            ? { ...li, quantity: qty, lineTotalCents: li.unitPriceCents * qty }
            : li,
        )
        .filter((li) => li.quantity > 0);
      return { lineItems, ...derive(lineItems, state.payments) };
    }),

  removeLineItem: (lineId) =>
    set((state) => {
      const lineItems = state.lineItems.filter((li) => li.id !== lineId);
      return { lineItems, ...derive(lineItems, state.payments) };
    }),

  addPayment: (payment) =>
    set((state) => {
      const payments = [...state.payments, payment];
      return { payments, ...derive(state.lineItems, payments) };
    }),

  removePayment: (paymentId) =>
    set((state) => {
      const payments = state.payments.filter((p) => p.id !== paymentId);
      return { payments, ...derive(state.lineItems, payments) };
    }),

  clear: () => set({ lineItems: [], payments: [], ...derive([], []) }),
}));

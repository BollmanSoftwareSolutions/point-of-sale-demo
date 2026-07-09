// TanStack Query key factory.
// See design-docs/05-state-and-routing.md §3.

import type { OrderSearchQuery } from "../api/orders";

export const keys = {
  menu: () => ["menu"] as const,
  orders: (params?: OrderSearchQuery) => ["orders", params] as const,
  order: (id: string) => ["orders", id] as const,
  kitchenOrders: () => ["orders", { status: "Kitchen" }] as const,
};

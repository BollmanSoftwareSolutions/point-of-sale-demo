// useOrders query hook (Order History search).
// See design-docs/05-state-and-routing.md §3.

import type { OrderSearchQuery } from "../api/orders";

// TODO: useQuery(keys.orders(params), () => searchOrders(params), { keepPreviousData })
export function useOrders(_params: OrderSearchQuery) {
  throw new Error("Not implemented");
}

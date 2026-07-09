// useOrders query hook (Order History search).
// See design-docs/05-state-and-routing.md §3.

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchOrders } from "../api/orders";
import type { OrderSearchQuery } from "../api/orders";
import { keys } from "./keys";

// Search/list for the History grid. Newest → oldest (server-sorted). Previous
// page data is kept while the next page/search loads to avoid layout jumps.
export function useOrders(params: OrderSearchQuery) {
  return useQuery({
    queryKey: keys.orders(params),
    queryFn: () => searchOrders(params),
    placeholderData: keepPreviousData,
  });
}

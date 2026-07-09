// useKitchenOrders query hook (Kitchen board, polled).
// See design-docs/05-state-and-routing.md §3 (Kitchen polling).

import { useQuery } from "@tanstack/react-query";
import { searchOrders } from "../api/orders";
import { keys } from "./keys";

// All Kitchen-status orders, oldest → newest (build order). Polled so newly
// created orders appear without a manual refresh.
export function useKitchenOrders() {
  return useQuery({
    queryKey: keys.kitchenOrders(),
    queryFn: () => searchOrders({ status: "Kitchen", sort: "asc", pageSize: 100 }),
    refetchInterval: 5000,
  });
}

// useOrder query hook (order detail).
// See design-docs/05-state-and-routing.md §3.

import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../api/orders";
import { keys } from "./keys";

export function useOrder(id: string) {
  return useQuery({
    queryKey: keys.order(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
}

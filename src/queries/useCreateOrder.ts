// useCreateOrder mutation hook.
// See design-docs/05-state-and-routing.md §3.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "../api/orders";
import type { CreateOrderRequest } from "../api/orders";
import type { Order } from "../types";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: createOrder,
    onSuccess: () => {
      // History + Kitchen both read from ['orders', ...] keys.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

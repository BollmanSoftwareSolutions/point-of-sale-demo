// useUpdateOrderStatus mutation hook (Kitchen "Completed" / History "Refund").
// See design-docs/05-state-and-routing.md §3.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../api/orders";
import type { Order } from "../types";

interface UpdateOrderStatusVars {
  id: string;
  status: "Fulfilled" | "Refunded";
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, UpdateOrderStatusVars>({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      // Refresh History search, Kitchen board, and any order detail queries.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// useMenu query hook.
// See design-docs/05-state-and-routing.md §3.

import { useQuery } from "@tanstack/react-query";
import { getMenu } from "../api/menu";
import { keys } from "./keys";

// Static seed data → never goes stale during a session.
export function useMenu() {
  return useQuery({
    queryKey: keys.menu(),
    queryFn: getMenu,
    staleTime: Infinity,
  });
}

// Menu data-access.
// See design-docs/04-api-contract.md (Menu section).

import { apiFetch } from "./client";
import type { Menu } from "../types";

// GET /api/menu
export async function getMenu(): Promise<Menu> {
  return apiFetch<Menu>("/menu");
}

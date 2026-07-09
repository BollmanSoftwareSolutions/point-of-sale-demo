// Menu data-access.
// See design-docs/04-api-contract.md (Menu section).

import type { Menu } from "../types";

// TODO: GET /api/menu
export async function getMenu(): Promise<Menu> {
  throw new Error("Not implemented");
}

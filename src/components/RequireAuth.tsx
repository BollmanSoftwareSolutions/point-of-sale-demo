// Route guard: redirects unauthenticated users to /login.
// See design-docs/05-state-and-routing.md §4.

import { Outlet } from "react-router";

export function RequireAuth() {
  // TODO: gate on authStore.isAuthenticated -> <Navigate to="/login" replace />.
  // Passes through for now so protected routes are reachable during scaffolding.
  return <Outlet />;
}

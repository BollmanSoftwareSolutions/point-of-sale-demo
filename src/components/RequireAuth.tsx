// Route guard: redirects unauthenticated users to /login.
// See design-docs/05-state-and-routing.md §4.

export function RequireAuth() {
  // TODO: read authStore.isAuthenticated -> <Outlet /> or <Navigate to="/login" />
  return null;
}

// App shell for authenticated screens: renders <Outlet/> + footer nav.
// See design-docs/03-ui-components.md (Global Layout).

import { Outlet } from "react-router";
import { FooterNav } from "./FooterNav";

export function AppLayout() {
  // TODO: replace inline styles with MUI theme-based layout.
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <FooterNav />
    </div>
  );
}

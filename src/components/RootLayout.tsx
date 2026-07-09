// Root shell wrapping all routes: renders active route + global SiteFooter.

import { Outlet } from "react-router";
import { SiteFooter } from "./SiteFooter";

export function RootLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}

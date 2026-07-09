// Root shell wrapping all routes: renders active route + global SiteFooter.

import { Outlet } from "react-router";
import { SiteFooter } from "./SiteFooter";

export function RootLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}

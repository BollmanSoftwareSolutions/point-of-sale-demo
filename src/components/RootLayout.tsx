// Root shell wrapping all routes: renders active route + global SiteFooter.

import { Navigate, Outlet, useLocation } from "react-router";
import { useMediaQuery } from "@mui/material";
import { SiteFooter } from "./SiteFooter";

// The app UI targets 1280x720 and larger. Smaller viewports are redirected
// to the mobile-friendly About page.
const MIN_VIEWPORT_QUERY = "(min-width:1280px) and (min-height:720px)";

export function RootLayout() {
  const location = useLocation();
  const isSupportedViewport = useMediaQuery(MIN_VIEWPORT_QUERY, { noSsr: true });
  const redirectToAbout = !isSupportedViewport && location.pathname !== "/about";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {redirectToAbout ? <Navigate to="/about" replace /> : <Outlet />}
      </div>
      <SiteFooter />
    </div>
  );
}

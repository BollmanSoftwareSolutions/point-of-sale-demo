// Global site footer shown on every page: copyright, company link, repo link.

import { Box, Link, Typography, useMediaQuery } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

const COMPANY_URL = "https://bollmansoftware.com";
const REPO_URL = "https://github.com/BollmanSoftwareSolutions/point-of-sale-demo";

// Matches the minimum supported viewport used by RootLayout.
const MIN_VIEWPORT_QUERY = "(min-width:1280px) and (min-height:720px)";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isSupportedViewport = useMediaQuery(MIN_VIEWPORT_QUERY, { noSsr: true });
  const isAboutPage = location.pathname === "/about";

  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        columnGap: { xs: 2, sm: 3 },
        rowGap: 1,
        px: { xs: 2, sm: 3 },
        py: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {year} Bollman Software Solutions, LLC
      </Typography>

      <Link
        href={COMPANY_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        underline="hover"
      >
        Bollman Software Solutions
      </Link>

      <Link
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        underline="hover"
        sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
      >
        <Box
          component="img"
          src="/GitHub_Invertocat_Black.svg"
          alt=""
          sx={{ width: 20, height: 20, display: "block" }}
        />
        POS-Demo Repo
      </Link>

      {isAboutPage ? (
        isSupportedViewport && (
          <Link
            component="button"
            type="button"
            onClick={() => navigate(-1)}
            variant="body2"
            underline="hover"
          >
            Back to Demo
          </Link>
        )
      ) : (
        <Link
          component={RouterLink}
          to="/about"
          variant="body2"
          underline="hover"
        >
          About This Demo
        </Link>
      )}
    </Box>
  );
}

// Global site footer shown on every page: copyright, company link, repo link.

import { Box, Link, Typography } from "@mui/material";

const COMPANY_URL = "https://bollmansoftware.com";
const REPO_URL = "https://github.com/BollmanSoftwareSolutions/point-of-sale-demo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 3,
        py: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {year} Bollman Software Solution, LLC
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
    </Box>
  );
}

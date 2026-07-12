// About page — describes the app flow and the technologies used.
// Public route rendered inside RootLayout so it shares the global SiteFooter.

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

// Matches the minimum supported viewport enforced by RootLayout.
const MIN_VIEWPORT_QUERY = "(min-width:1280px) and (min-height:720px)";

const flowSteps = [
  {
    title: "1. Login",
    body:
      "Employees sign in with a 6-character employee ID followed by a 4-digit PIN, entered through an on-screen number pad built for touch displays.",
  },
  {
    title: "2. Ordering",
    body:
      "Browse menu categories, configure items with modifiers, and build a cart. The running total and payment panel update live as items are added.",
  },
  {
    title: "3. Payment",
    body:
      "Review the order summary, take payment, and submit the order. A new ticket is created and handed off to the kitchen.",
  },
  {
    title: "4. Kitchen",
    body:
      "Open tickets appear on the kitchen board in real time. Staff advance each order through its preparation stages until it is complete.",
  },
  {
    title: "5. Order History",
    body:
      "Completed and in-progress orders are searchable and filterable, with a detail panel that breaks down line items, totals, and status.",
  },
];

const technologies = [
  { name: "React 19", note: "UI component framework" },
  { name: "TypeScript", note: "End-to-end type safety" },
  { name: "Vite", note: "Dev server & build tooling" },
  { name: "Material UI (MUI)", note: "Themed component library" },
  { name: "React Router", note: "Client-side routing" },
  { name: "TanStack Query", note: "Server-state & data fetching" },
  { name: "Zustand", note: "Lightweight client state" },
  { name: "Mock Service Worker", note: "In-browser mock API" },
  { name: "Vitest + Testing Library", note: "Unit & component tests" },
];

export function AboutScreen() {
  const isSupportedViewport = useMediaQuery(MIN_VIEWPORT_QUERY, { noSsr: true });

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Stack spacing={{ xs: 3, sm: 4 }}>
          <Box>
            <Typography
              variant="h3"
              color="primary"
              sx={{ fontWeight: 700, fontSize: { xs: "1.9rem", sm: "3rem" } }}
            >
              About This Demo
            </Typography>

            {!isSupportedViewport && (
              <Alert severity="info" sx={{ mt: 2 }}>
                The interactive demo isn't supported on screens smaller than
                1280 × 720. Please open this page on a larger display to try it
                out.
              </Alert>
            )}

            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              A point-of-sale (POS) demo showcasing a complete order lifecycle —
              from employee login through ordering, payment, kitchen prep, and
              order history — powered by a fully mocked API.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              How the app flows
            </Typography>
            <Stack spacing={2}>
              {flowSteps.map((step) => (
                <Card key={step.title} variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {step.body}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Technologies used
            </Typography>
            <Stack
              direction="row"
              useFlexGap
              spacing={1.5}
              sx={{ flexWrap: "wrap" }}
            >
              {technologies.map((tech) => (
                <Chip
                  key={tech.name}
                  color="primary"
                  variant="outlined"
                  label={
                    <Box component="span">
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {tech.name}
                      </Box>
                      <Box component="span" sx={{ color: "text.secondary" }}>
                        {" — "}
                        {tech.note}
                      </Box>
                    </Box>
                  }
                  sx={{ height: "auto", py: 0.75, borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

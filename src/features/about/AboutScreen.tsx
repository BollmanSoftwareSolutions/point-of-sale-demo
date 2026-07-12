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
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import logo from "../../assets/logo-color-g.svg";
import csharpLogo from "../../assets/CSharp.svg";
import reactLogo from "../../assets/React.svg";
import mongodbLogo from "../../assets/MongoDB.svg";
import rabbitMQLogo from "../../assets/RabbitMQ.svg";
import tsysLogo from "../../assets/tsys-logo.png";
import tsLogo from "../../assets/ts-logo-128.svg";
import electronLogo from "../../assets/electronjs-icon.svg";
import { useNavigate } from "react-router";

type Tech = {
  name: string;
  icon: string;
  description: string;
};

// Matches the minimum supported viewport enforced by RootLayout.
const MIN_VIEWPORT_QUERY = "(min-width:1280px) and (min-height:720px)";

const feTech: Tech[] = [
  { name: "React", icon: reactLogo, description: "UI component framework" },
  { name: "TypeScript", icon: tsLogo, description: "End-to-end type safety" },
  { name: "Electron", icon: electronLogo, description: "Desktop application framework" },
  { name: "RabbitMQ", icon: rabbitMQLogo, description: "Message broker" },
];

const beTech: Tech[] = [
  { name: ".NET", icon: csharpLogo, description: "Backend API" },
  { name: "MongoDB", icon: mongodbLogo, description: "Database" },
  { name: "RabbitMQ", icon: rabbitMQLogo, description: "Message broker" },
];

const intTech: Tech[] = [
  { name: "AWS", icon: "https://d0.awsstatic.com/logos/powered-by-aws.png", description: "Hosting" },
  { name: "TSYS", icon: tsysLogo, description: "Payment processor" },
];

const architecture = [
  {
    title: "Backend API",
    body: "Employees sign in with a 6-character employee ID followed by a 4-digit PIN, entered through an on-screen number pad built for touch displays.",
  },
  {
    title: "Frontend",
    body: "Browse menu categories, configure items with modifiers, and build a cart. The running total and payment panel update live as items are added.",
  },
  {
    title: "Database",
    body: "Review the order summary, take payment, and submit the order. A new ticket is created and handed off to the kitchen.",
  },
  {
    title: "Realtime Updates",
    body: "Open tickets appear on the kitchen board in real time. Staff advance each order through its preparation stages until it is complete.",
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
  const navigate = useNavigate();
  const isSupportedViewport = useMediaQuery(MIN_VIEWPORT_QUERY, { noSsr: true });

  const techStack = (techList: Tech[]) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {techList.map((tech) => (
        <Chip
          key={tech.name}
          color="primary"
          variant="outlined"
          icon={<Box component="img" src={tech.icon} alt={tech.name} sx={{ maxHeight: 24, px: 1 }} />}
          label={<Box component="span" sx={{ fontWeight: 700 }}>{tech.name}</Box>}
          sx={{
            height: "auto",
            py: 1,
            px: 1.5,
            borderRadius: 2,
            backgroundColor: "background.paper",
            "& .MuiChip-label": {
              overflow: "visible",
            },
          }}
        />
      ))}
    </Box>
  );

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
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.9rem", sm: "3rem" },
                textAlign: "center",
                color: "primary.dark",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  lineHeight: 1,
                  width: "auto",
                  height: { xs: "1.9rem", sm: "3rem" },
                  mr: 1,
                  verticalAlign: "text-bottom",
                }}
              />
              Point of Sale Solution
            </Typography>

            {!isSupportedViewport && (
              <Alert severity="info" sx={{ mt: 2 }}>
                The interactive demo isn't supported on screens smaller than 1280 × 720. Please open this page on a
                larger display to try it out.
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Project Overview
            </Typography>

            <Typography variant="body1" sx={{ mt: 2, color: "text.primary" }}>
              This demo is a recreation of a point-of-sale (POS) system developed from 2019 through 2021. The system was
              used at fast food or similar quick service restaurants to take orders, process payments, and manage
              kitchen workflow. It spanned POS terminals, kitchen displays, and store level menu and inventory
              management.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2, color: "text.primary" }}>
              The UI was an Electron-based desktop application built with React and TypeScript. The backend was a .NET
              API that handled authentication, order management, and kitchen workflow. The system used MongoDB for data
              storage and RabbitMQ for real-time communication between the store level systems and individual POS
              terminals. The application was containerized with Docker allowing seamless deployment to Windows or Linux
              based terminals.
            </Typography>

            <Typography variant="body1" sx={{ mt: 2, color: "text.primary" }}>
              I integrated TSYS payment processing into the system to handle credit and gift card transactions. The
              integration was done using TSYS's API, which allowed for secure and efficient payment processing.
            </Typography>
          </Box>

          <Box>
            <Box sx={{ my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Frontend Technologies
              </Typography>
              {techStack(feTech)}
            </Box>

            <Box sx={{ my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Backend Technologies
              </Typography>
              {techStack(beTech)}
            </Box>

            <Box sx={{ my: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Integration Technologies
              </Typography>
              {techStack(intTech)}
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Architecture
            </Typography>

            <Stack spacing={2}>
              {architecture.map((step) => (
                <Card key={step.title} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
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

            <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: "wrap" }}>
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

          {isSupportedViewport && (
            <Link sx={{ textDecoration: "none" }} component="button" onClick={() => navigate("/login")}>
              <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "left", textDecoration: "none" }}>
                <ArrowForward sx={{ verticalAlign: "middle" }} /> Try the Interactive Demo for yourself
              </Typography>
            </Link>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

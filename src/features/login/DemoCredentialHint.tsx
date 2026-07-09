// Demo credential hint shown at the bottom of the login page.
// See design-docs/03-ui-components.md §1.

import { Typography } from "@mui/material";
import { demoCredential } from "../../mocks/seed/employees";

export function DemoCredentialHint() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      Demo user: <strong>{demoCredential.employeeId}</strong> · PIN{" "}
      <strong>{demoCredential.pin}</strong>
    </Typography>
  );
}

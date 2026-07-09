// Seed data: mock employees. Demo credentials are surfaced on the login screen.
// See design-docs/02-data-models.md §2 & §6.
//
// Employee id: 6 chars from [0-9A-D]. PIN: 4 digits [0-9]. Demo-only — never
// store plain PINs in a real system.

import type { Employee } from "../../types";

export const seedEmployees: Employee[] = [
  { id: "ABC123", pin: "1111", name: "Jimmy Ayala" },
  { id: "1A2B3C", pin: "1234", name: "Alex Rivera" },
  { id: "4D5C6B", pin: "4321", name: "Jordan Kim" },
];

// Credential shown at the bottom of the Login page for the demo.
export const demoCredential = {
  employeeId: seedEmployees[0].id,
  pin: seedEmployees[0].pin,
};

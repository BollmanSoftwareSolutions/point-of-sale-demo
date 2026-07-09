// Domain types for employees.
// See design-docs/02-data-models.md §2.

export interface Employee {
  id: string; // 6 chars, alphabet 0-9 + A-D, e.g. "1A2B3C"
  pin: string; // 4 digits 0-9 (demo only — never store plain PINs for real)
  name: string; // Display name
}

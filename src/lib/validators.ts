// Validators for employee id / PIN.
// See design-docs/02-data-models.md §2.

// TODO: exactly 6 chars, each in [0-9A-D].
export function isValidEmployeeId(_id: string): boolean {
  throw new Error("Not implemented");
}

// TODO: exactly 4 chars, each in [0-9].
export function isValidPin(_pin: string): boolean {
  throw new Error("Not implemented");
}

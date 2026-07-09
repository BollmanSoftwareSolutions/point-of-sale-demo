// Validators for employee id / PIN.
// See design-docs/02-data-models.md §2.

const EMPLOYEE_ID_RE = /^[0-9A-D]{6}$/;
const PIN_RE = /^[0-9]{4}$/;
const EMPLOYEE_ID_CHAR_RE = /^[0-9A-D]$/;
const PIN_CHAR_RE = /^[0-9]$/;

// Exactly 6 chars, each in [0-9A-D].
export function isValidEmployeeId(id: string): boolean {
  return EMPLOYEE_ID_RE.test(id);
}

// Exactly 4 chars, each in [0-9].
export function isValidPin(pin: string): boolean {
  return PIN_RE.test(pin);
}

// Single-character guards used to filter number-pad input.
export function isEmployeeIdChar(ch: string): boolean {
  return EMPLOYEE_ID_CHAR_RE.test(ch);
}

export function isPinChar(ch: string): boolean {
  return PIN_CHAR_RE.test(ch);
}

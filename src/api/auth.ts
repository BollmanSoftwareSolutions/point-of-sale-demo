// Auth data-access: login + employee existence check.
// See design-docs/04-api-contract.md (Auth section).

export interface LoginRequest {
  employeeId: string; // 6 chars [0-9A-D]
  pin: string; // 4 digits [0-9]
}

export interface LoginResponse {
  sessionToken: string;
  employee: { id: string; name: string };
}

// TODO: POST /api/auth/login
export async function login(_req: LoginRequest): Promise<LoginResponse> {
  throw new Error("Not implemented");
}

// TODO: GET /api/employees/:id/exists
export async function employeeExists(_id: string): Promise<boolean> {
  throw new Error("Not implemented");
}

// Auth data-access: login + employee existence check.
// See design-docs/04-api-contract.md (Auth section).

import { apiFetch } from "./client";

export interface LoginRequest {
  employeeId: string; // 6 chars [0-9A-D]
  pin: string; // 4 digits [0-9]
}

export interface LoginResponse {
  sessionToken: string;
  employee: { id: string; name: string };
}

// POST /api/auth/login
export async function login(req: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// GET /api/employees/:id/exists
export async function employeeExists(id: string): Promise<boolean> {
  const result = await apiFetch<{ exists: boolean }>(
    `/employees/${encodeURIComponent(id)}/exists`,
  );
  return result.exists;
}

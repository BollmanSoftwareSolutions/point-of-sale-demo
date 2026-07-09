// Base fetch wrapper: Authorization header + error mapping.
// See design-docs/04-api-contract.md and design-docs/06-project-structure.md.

import { useAuthStore } from "../stores/authStore";

export const API_BASE = "/api";

export interface ApiError {
  code: string;
  message: string;
}

// Thrown for any non-2xx response. Carries the contract error code so callers
// (e.g. the login flow) can branch on it.
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().sessionToken;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!response.ok) {
    let code = "request_failed";
    let message = response.statusText || "Request failed";
    try {
      const body = (await response.json()) as { error?: ApiError };
      if (body.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
      }
    } catch {
      // Response body was not JSON; keep the defaults above.
    }
    throw new ApiRequestError(response.status, code, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

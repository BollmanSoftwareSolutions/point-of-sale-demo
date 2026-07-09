// Base fetch wrapper: Authorization header + error mapping.
// See design-docs/04-api-contract.md and design-docs/06-project-structure.md.

export const API_BASE = "/api";

export interface ApiError {
  code: string;
  message: string;
}

// TODO: implement typed fetch wrapper (auth header, JSON parse, error mapping).
export async function apiFetch<T>(_path: string, _init?: RequestInit): Promise<T> {
  throw new Error("Not implemented");
}

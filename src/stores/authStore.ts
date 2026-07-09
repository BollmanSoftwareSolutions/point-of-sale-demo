// Zustand auth store (session, current employee).
// See design-docs/05-state-and-routing.md §2 (authStore).

import type { LoginResponse } from "../api/auth";

export interface AuthState {
  sessionToken: string | null;
  employee: { id: string; name: string } | null;
  isAuthenticated: boolean;
  login: (session: LoginResponse) => void;
  logout: () => void;
}

// TODO: implement with create<AuthState>()(...)

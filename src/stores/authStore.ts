// Zustand auth store (session, current employee).
// See design-docs/05-state-and-routing.md §2 (authStore).

import { create } from "zustand";
import type { LoginResponse } from "../api/auth";

export interface AuthState {
  sessionToken: string | null;
  employee: { id: string; name: string } | null;
  isAuthenticated: boolean;
  login: (session: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  sessionToken: null,
  employee: null,
  isAuthenticated: false,
  login: (session) =>
    set({
      sessionToken: session.sessionToken,
      employee: session.employee,
      isAuthenticated: true,
    }),
  logout: () => set({ sessionToken: null, employee: null, isAuthenticated: false }),
}));

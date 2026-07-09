// useLogin mutation hook.
// See design-docs/05-state-and-routing.md §3.

import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import type { LoginRequest, LoginResponse } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.login);
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (session) => setSession(session),
  });
}

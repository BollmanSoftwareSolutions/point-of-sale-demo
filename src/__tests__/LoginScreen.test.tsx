import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { LoginScreen } from "../features/login/LoginScreen";
import { ApiRequestError } from "../api/client";
import { useAuthStore } from "../stores/authStore";
import { theme } from "../theme";
import * as authApi from "../api/auth";

vi.mock("../api/auth");

const mockedAuth = vi.mocked(authApi);

type UserEventApi = ReturnType<typeof userEvent.setup>;

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/order" element={<div>ORDER PAGE</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

async function pressKeys(user: UserEventApi, keys: string) {
  for (const key of keys) {
    await user.click(screen.getByRole("button", { name: key }));
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ sessionToken: null, employee: null, isAuthenticated: false });
});

describe("LoginScreen", () => {
  it("logs in through the two-step flow and navigates to /order", async () => {
    mockedAuth.employeeExists.mockResolvedValue(true);
    mockedAuth.login.mockResolvedValue({
      sessionToken: "session-token",
      employee: { id: "ABC123", name: "Jimmy Ayala" },
    });
    const user = userEvent.setup();
    renderLogin();

    // Step 1: enter the employee id and submit.
    await pressKeys(user, "ABC123");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Step 2: the PIN field appears.
    expect(await screen.findByLabelText("PIN")).toBeInTheDocument();

    await pressKeys(user, "1111");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("ORDER PAGE")).toBeInTheDocument();
    expect(mockedAuth.login.mock.calls[0][0]).toEqual({ employeeId: "ABC123", pin: "1111" });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("shows an error when the employee id is not found", async () => {
    mockedAuth.employeeExists.mockResolvedValue(false);
    const user = userEvent.setup();
    renderLogin();

    await pressKeys(user, "999999");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Employee not found")).toBeInTheDocument();
    expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument();
    expect(mockedAuth.login).not.toHaveBeenCalled();
  });

  it("shows an error for an incorrect PIN", async () => {
    mockedAuth.employeeExists.mockResolvedValue(true);
    mockedAuth.login.mockRejectedValue(new ApiRequestError(401, "invalid_pin", "Incorrect PIN"));
    const user = userEvent.setup();
    renderLogin();

    await pressKeys(user, "ABC123");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByLabelText("PIN");

    await pressKeys(user, "2222");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Incorrect PIN")).toBeInTheDocument();
    expect(screen.queryByText("ORDER PAGE")).not.toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

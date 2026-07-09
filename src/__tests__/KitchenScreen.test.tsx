import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { KitchenBoard } from "../features/kitchen/KitchenBoard";
import { KitchenOrderCard } from "../features/kitchen/KitchenOrderCard";
import { keys } from "../queries/keys";
import { theme } from "../theme";
import * as ordersApi from "../api/orders";
import type { OrderSummaryRow } from "../api/orders";
import type { AppliedModifier, Order, OrderLineItem } from "../types";

vi.mock("../api/orders");

const mockedOrders = vi.mocked(ordersApi);

// --- Fixtures ---------------------------------------------------------------

function makeLineItem(
  id: string,
  overrides: Partial<OrderLineItem> = {},
): OrderLineItem {
  return {
    id,
    menuItemId: "menu-1",
    displayName: "Crunchy Taco",
    quantity: 1,
    selectedOptionIds: [],
    selectedModifierIds: [],
    appliedModifiers: [],
    unitPriceCents: 500,
    lineTotalCents: 500,
    ...overrides,
  };
}

function makeOrder(id: string, lineItems: OrderLineItem[]): Order {
  return {
    id,
    employeeId: "E1",
    createdAt: "2026-07-09T12:00:00.000Z",
    status: "Kitchen",
    lineItems,
    payments: [],
    subtotalCents: lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0),
    totalCents: lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0),
  };
}

function summaryRow(id: string): OrderSummaryRow {
  return { id, createdAt: "2026-07-09T12:00:00.000Z", status: "Kitchen", itemsPreview: "" };
}

function newClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithClient(ui: React.ReactElement, client: QueryClient = newClient()) {
  render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// --- KitchenBoard -----------------------------------------------------------

describe("KitchenBoard", () => {
  it("renders a card per kitchen order and fills the rest of the 8 slots as empty", async () => {
    mockedOrders.searchOrders.mockResolvedValue({
      results: [summaryRow("1001"), summaryRow("1002")],
      page: 1,
      pageSize: 100,
      total: 2,
    });
    const ordersById: Record<string, Order> = {
      "1001": makeOrder("1001", [makeLineItem("1001-L1")]),
      "1002": makeOrder("1002", [makeLineItem("1002-L1")]),
    };
    mockedOrders.getOrder.mockImplementation((id: string) => Promise.resolve(ordersById[id]));

    renderWithClient(<KitchenBoard />);

    expect(await screen.findByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();
    // Two cards + six empty placeholders = eight slots.
    expect(screen.getAllByText("Empty")).toHaveLength(6);
  });

  it("shows item details with quantities and modifiers but no prices", async () => {
    mockedOrders.searchOrders.mockResolvedValue({
      results: [summaryRow("1001")],
      page: 1,
      pageSize: 100,
      total: 1,
    });
    const modifier: AppliedModifier = { name: "Add Guacamole", priceModifierCents: 50 };
    const order = makeOrder("1001", [
      makeLineItem("1001-L1", {
        displayName: "Crunchy Taco",
        quantity: 2,
        appliedModifiers: [modifier],
        unitPriceCents: 550,
        lineTotalCents: 1100,
      }),
    ]);
    mockedOrders.getOrder.mockResolvedValue(order);

    renderWithClient(<KitchenBoard />);

    expect(await screen.findByText("2× Crunchy Taco")).toBeInTheDocument();
    expect(screen.getByText("• Add Guacamole")).toBeInTheDocument();
    // Prices must never appear on the kitchen board.
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/11\.00|5\.50|1100|550/)).not.toBeInTheDocument();
  });

  it("shows a loading state while kitchen orders are loading", () => {
    mockedOrders.searchOrders.mockImplementation(() => new Promise(() => {}));

    renderWithClient(<KitchenBoard />);

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("shows an error state when the kitchen query fails", async () => {
    mockedOrders.searchOrders.mockRejectedValue(new Error("boom"));

    renderWithClient(<KitchenBoard />);

    expect(await screen.findByText("Failed to load kitchen orders")).toBeInTheDocument();
  });

  it("renders eight empty slots when there are no kitchen orders", async () => {
    mockedOrders.searchOrders.mockResolvedValue({
      results: [],
      page: 1,
      pageSize: 100,
      total: 0,
    });

    renderWithClient(<KitchenBoard />);

    expect(await screen.findAllByText("Empty")).toHaveLength(8);
  });

  it("completing an order calls updateOrderStatus with Fulfilled", async () => {
    mockedOrders.searchOrders.mockResolvedValue({
      results: [summaryRow("1001")],
      page: 1,
      pageSize: 100,
      total: 1,
    });
    const order = makeOrder("1001", [makeLineItem("1001-L1")]);
    mockedOrders.getOrder.mockResolvedValue(order);
    mockedOrders.updateOrderStatus.mockResolvedValue({ ...order, status: "Fulfilled" });
    const user = userEvent.setup();

    renderWithClient(<KitchenBoard />);
    await screen.findByText("#1001");

    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(mockedOrders.updateOrderStatus).toHaveBeenCalledWith("1001", "Fulfilled");
  });
});

// --- KitchenOrderCard -------------------------------------------------------

describe("KitchenOrderCard", () => {
  it("shows the order number immediately from the id, before details load", () => {
    mockedOrders.getOrder.mockImplementation(() => new Promise(() => {}));

    renderWithClient(<KitchenOrderCard orderId="1042" />);

    expect(screen.getByText("#1042")).toBeInTheDocument();
  });

  it("auto-scrolls overflow lines every 10 seconds", () => {
    vi.useFakeTimers();
    // Ten single-line items overflow the 8-line window.
    const lineItems = Array.from({ length: 10 }, (_, i) =>
      makeLineItem(`1001-L${i + 1}`, { displayName: `Item${i + 1}` }),
    );
    const order = makeOrder("1001", lineItems);
    mockedOrders.getOrder.mockResolvedValue(order);

    // Seed the cache so the detail renders synchronously (no async under fake timers).
    const client = newClient();
    client.setQueryData(keys.order("1001"), order);

    renderWithClient(<KitchenOrderCard orderId="1001" />, client);

    // Initial window: Item1..Item8 visible; Item9 hidden.
    expect(screen.getByText("Item1")).toBeInTheDocument();
    expect(screen.getByText("Item8")).toBeInTheDocument();
    expect(screen.queryByText("Item9")).not.toBeInTheDocument();

    // After 10s the window advances by one line.
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText("Item9")).toBeInTheDocument();
    expect(screen.queryByText("Item1")).not.toBeInTheDocument();
  });

  it("does not scroll when the order fits within the visible window", () => {
    vi.useFakeTimers();
    const lineItems = Array.from({ length: 3 }, (_, i) =>
      makeLineItem(`1001-L${i + 1}`, { displayName: `Item${i + 1}` }),
    );
    const order = makeOrder("1001", lineItems);
    mockedOrders.getOrder.mockResolvedValue(order);

    const client = newClient();
    client.setQueryData(keys.order("1001"), order);

    renderWithClient(<KitchenOrderCard orderId="1001" />, client);

    expect(screen.getByText("Item1")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    // All lines remain visible; nothing scrolled out of view.
    expect(screen.getByText("Item1")).toBeInTheDocument();
    expect(screen.getByText("Item3")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { OrderSearchBar, emptyFilters } from "../features/history/OrderSearchBar";
import type { HistoryFilters } from "../features/history/OrderSearchBar";
import { OrderHistoryGrid } from "../features/history/OrderHistoryGrid";
import { OrderDetailPanel } from "../features/history/OrderDetailPanel";
import { keys } from "../queries/keys";
import { theme } from "../theme";
import * as ordersApi from "../api/orders";
import type { OrderSearchResponse, OrderSummaryRow } from "../api/orders";
import type { AppliedModifier, Order, OrderLineItem, Payment } from "../types";

vi.mock("../api/orders");

const mockedOrders = vi.mocked(ordersApi);

// --- Fixtures ---------------------------------------------------------------

function summaryRow(id: string, overrides: Partial<OrderSummaryRow> = {}): OrderSummaryRow {
  return {
    id,
    createdAt: "2026-07-09T12:00:00.000Z",
    status: "Fulfilled",
    itemsPreview: "Crunchy Taco, Nachos",
    ...overrides,
  };
}

function searchResponse(
  results: OrderSummaryRow[],
  overrides: Partial<OrderSearchResponse> = {},
): OrderSearchResponse {
  return { results, page: 1, pageSize: 10, total: results.length, ...overrides };
}

function makeLineItem(id: string, overrides: Partial<OrderLineItem> = {}): OrderLineItem {
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

function makePayment(id: string, overrides: Partial<Payment> = {}): Payment {
  return {
    id,
    method: "Card",
    amountCents: 500,
    createdAt: "2026-07-09T12:00:00.000Z",
    ...overrides,
  };
}

function makeOrder(id: string, overrides: Partial<Order> = {}): Order {
  const lineItems = overrides.lineItems ?? [makeLineItem(`${id}-L1`)];
  const subtotalCents = lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0);
  return {
    id,
    employeeId: "E1",
    createdAt: "2026-07-09T12:00:00.000Z",
    status: "Fulfilled",
    lineItems,
    payments: [makePayment(`${id}-P1`, { amountCents: subtotalCents })],
    subtotalCents,
    totalCents: subtotalCents,
    ...overrides,
  };
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

// --- OrderSearchBar ---------------------------------------------------------

describe("OrderSearchBar", () => {
  it("reflects the current filter values", () => {
    const filters: HistoryFilters = { q: "taco", from: "2026-07-01", to: "2026-07-09" };
    render(
      <ThemeProvider theme={theme}>
        <OrderSearchBar filters={filters} onChange={() => {}} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("textbox", { name: "Search" })).toHaveValue("taco");
    expect(screen.getByLabelText("From")).toHaveValue("2026-07-01");
    expect(screen.getByLabelText("To")).toHaveValue("2026-07-09");
  });

  it("calls onChange when the text query changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={theme}>
        <OrderSearchBar filters={emptyFilters} onChange={onChange} />
      </ThemeProvider>,
    );

    await user.type(screen.getByRole("textbox", { name: "Search" }), "n");

    expect(onChange).toHaveBeenCalledWith({ q: "n", from: "", to: "" });
  });

  it("calls onChange when the from/to dates change", () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <OrderSearchBar filters={emptyFilters} onChange={onChange} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-07-01" } });
    expect(onChange).toHaveBeenCalledWith({ q: "", from: "2026-07-01", to: "" });

    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-07-09" } });
    expect(onChange).toHaveBeenCalledWith({ q: "", from: "", to: "2026-07-09" });
  });

  it("disables Clear when there are no filters and clears when clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <OrderSearchBar filters={emptyFilters} onChange={onChange} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Clear filters" })).toBeDisabled();

    rerender(
      <ThemeProvider theme={theme}>
        <OrderSearchBar filters={{ q: "taco", from: "", to: "" }} onChange={onChange} />
      </ThemeProvider>,
    );

    const clearButton = screen.getByRole("button", { name: "Clear filters" });
    expect(clearButton).toBeEnabled();
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(emptyFilters);
  });
});

// --- OrderHistoryGrid -------------------------------------------------------

describe("OrderHistoryGrid", () => {
  const noop = () => {};

  it("renders a row per result with order #, status, and items preview", async () => {
    mockedOrders.searchOrders.mockResolvedValue(
      searchResponse(
        [
          summaryRow("1042", { status: "Fulfilled", itemsPreview: "Crunchy Taco, Nachos" }),
          summaryRow("1041", { status: "Refunded", itemsPreview: "Bean Burrito" }),
        ],
        { total: 2 },
      ),
    );

    renderWithClient(
      <OrderHistoryGrid filters={emptyFilters} page={0} onPageChange={noop} onSelect={noop} />,
    );

    expect(await screen.findByText("1042")).toBeInTheDocument();
    expect(screen.getByText("Crunchy Taco, Nachos")).toBeInTheDocument();
    expect(screen.getByText("Bean Burrito")).toBeInTheDocument();
    expect(screen.getByText("Fulfilled")).toBeInTheDocument();
    expect(screen.getByText("Refunded")).toBeInTheDocument();
  });

  it("formats the date column as MM/DD HH:mm", async () => {
    mockedOrders.searchOrders.mockResolvedValue(searchResponse([summaryRow("1042")], { total: 1 }));

    renderWithClient(
      <OrderHistoryGrid filters={emptyFilters} page={0} onPageChange={noop} onSelect={noop} />,
    );

    await screen.findByText("1042");
    expect(screen.getByText(/^\d{2}\/\d{2} \d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it("passes the search filters and 1-based page to the query", async () => {
    mockedOrders.searchOrders.mockResolvedValue(searchResponse([summaryRow("1042")], { total: 1 }));

    renderWithClient(
      <OrderHistoryGrid
        filters={{ q: "taco", from: "2026-07-01", to: "2026-07-09" }}
        page={2}
        onPageChange={noop}
        onSelect={noop}
      />,
    );

    await waitFor(() =>
      expect(mockedOrders.searchOrders).toHaveBeenCalledWith({
        q: "taco",
        from: "2026-07-01",
        to: "2026-07-09",
        page: 3,
        pageSize: 10,
      }),
    );
  });

  it("calls onSelect with the order id when a row is clicked", async () => {
    mockedOrders.searchOrders.mockResolvedValue(searchResponse([summaryRow("1042")], { total: 1 }));
    const onSelect = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <OrderHistoryGrid filters={emptyFilters} page={0} onPageChange={noop} onSelect={onSelect} />,
    );

    await user.click(await screen.findByText("Crunchy Taco, Nachos"));

    expect(onSelect).toHaveBeenCalledWith("1042");
  });

  it("advances the page via pagination controls", async () => {
    mockedOrders.searchOrders.mockResolvedValue(
      searchResponse([summaryRow("1042")], { total: 25 }),
    );
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    renderWithClient(
      <OrderHistoryGrid
        filters={emptyFilters}
        page={0}
        onPageChange={onPageChange}
        onSelect={noop}
      />,
    );

    await screen.findByText("1042");
    await user.click(screen.getByRole("button", { name: /next page/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows an error state when the query fails", async () => {
    mockedOrders.searchOrders.mockRejectedValue(new Error("boom"));

    renderWithClient(
      <OrderHistoryGrid filters={emptyFilters} page={0} onPageChange={noop} onSelect={noop} />,
    );

    expect(await screen.findByText("Failed to load orders")).toBeInTheDocument();
  });
});

// --- OrderDetailPanel -------------------------------------------------------

describe("OrderDetailPanel", () => {
  const noop = () => {};

  it("renders line items, modifiers, totals, and payments", async () => {
    const modifier: AppliedModifier = { name: "Add Guacamole", priceModifierCents: 50 };
    const order = makeOrder("1042", {
      lineItems: [
        makeLineItem("1042-L1", {
          displayName: "Crunchy Taco",
          quantity: 2,
          appliedModifiers: [modifier],
          unitPriceCents: 550,
          lineTotalCents: 1100,
        }),
      ],
      payments: [makePayment("1042-P1", { method: "GiftCertificate", amountCents: 1100 })],
    });
    mockedOrders.getOrder.mockResolvedValue(order);

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />);

    expect(await screen.findByText("Order #1042")).toBeInTheDocument();
    expect(screen.getByText("2× Crunchy Taco")).toBeInTheDocument();
    expect(screen.getByText("Add Guacamole")).toBeInTheDocument();
    expect(screen.getByText("$0.50")).toBeInTheDocument(); // modifier price delta
    expect(screen.getByText("Gift Certificate")).toBeInTheDocument(); // payment label
    // $11.00 appears as the line total, subtotal, total, and single payment.
    expect(screen.getAllByText("$11.00")).toHaveLength(4);
  });

  it("refunds the order via updateOrderStatus when Refund is clicked", async () => {
    const order = makeOrder("1042", { status: "Fulfilled" });
    mockedOrders.getOrder.mockResolvedValue(order);
    mockedOrders.updateOrderStatus.mockResolvedValue({ ...order, status: "Refunded" });
    const user = userEvent.setup();

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />);
    await screen.findByText("Order #1042");

    await user.click(screen.getByRole("button", { name: "Refund" }));

    expect(mockedOrders.updateOrderStatus).toHaveBeenCalledWith("1042", "Refunded");
  });

  it("disables the Refund button for an already-refunded order", async () => {
    mockedOrders.getOrder.mockResolvedValue(makeOrder("1042", { status: "Refunded" }));

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />);
    await screen.findByText("Order #1042");

    expect(screen.getByRole("button", { name: "Refunded" })).toBeDisabled();
    expect(mockedOrders.updateOrderStatus).not.toHaveBeenCalled();
  });

  it("calls onBack when the back control is used", async () => {
    mockedOrders.getOrder.mockResolvedValue(makeOrder("1042"));
    const onBack = vi.fn();
    const user = userEvent.setup();

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={onBack} />);
    await screen.findByText("Order #1042");

    await user.click(screen.getByRole("button", { name: "Back to results" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state while the order loads", () => {
    mockedOrders.getOrder.mockImplementation(() => new Promise(() => {}));

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />);

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("shows an error state when the order fails to load", async () => {
    mockedOrders.getOrder.mockRejectedValue(new Error("boom"));

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />);

    expect(await screen.findByText("Failed to load order")).toBeInTheDocument();
  });

  it("renders detail synchronously from seeded query cache", () => {
    const order = makeOrder("1042", {
      lineItems: [makeLineItem("1042-L1", { displayName: "Nacho Fries", lineTotalCents: 199 })],
    });
    const client = newClient();
    client.setQueryData(keys.order("1042"), order);

    renderWithClient(<OrderDetailPanel orderId="1042" onBack={noop} />, client);

    expect(screen.getByText("Nacho Fries")).toBeInTheDocument();
  });
});

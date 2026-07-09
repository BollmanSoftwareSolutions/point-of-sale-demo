import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import { ItemConfigurator } from "../features/ordering/ItemConfigurator";
import { OrderSummary } from "../features/ordering/OrderSummary";
import { PaymentPanel } from "../features/ordering/PaymentPanel";
import { OrderingScreen } from "../features/ordering/OrderingScreen";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { theme } from "../theme";
import * as menuApi from "../api/menu";
import * as ordersApi from "../api/orders";
import type { CategoryItem, Menu, MenuItem, Order, OrderLineItem } from "../types";

vi.mock("../api/menu");
vi.mock("../api/orders");

const mockedMenu = vi.mocked(menuApi);
const mockedOrders = vi.mocked(ordersApi);

// --- Fixtures ---------------------------------------------------------------

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: "combo-1",
    displayName: "Test Combo",
    basePriceCents: 500,
    sizes: [
      { id: "sm", name: "Small", priceModifierCents: 0, isDefault: true },
      { id: "lg", name: "Large", priceModifierCents: 80 },
    ],
    options: [
      { id: "opt-fries", name: "Fries", priceModifierCents: 0, isDefault: true },
      { id: "opt-rings", name: "Onion Rings", priceModifierCents: 50 },
    ],
    modifiers: [
      { id: "m-cheese", name: "Extra Cheese", priceModifierCents: 50 },
      { id: "m-guac", name: "Add Guacamole", priceModifierCents: 80 },
    ],
    ...overrides,
  };
}

function makeCategoryItem(item: MenuItem, overrides: Partial<CategoryItem> = {}): CategoryItem {
  return { id: "ci-1", name: "Combo #1", icon: "Fastfood", items: [item], ...overrides };
}

function makeLineItem(id: string, overrides: Partial<OrderLineItem> = {}): OrderLineItem {
  return {
    id,
    menuItemId: "combo-1",
    displayName: "Test Combo",
    quantity: 1,
    selectedOptionIds: [],
    selectedModifierIds: [],
    appliedModifiers: [],
    unitPriceCents: 520,
    lineTotalCents: 520,
    ...overrides,
  };
}

const seedMenu: Menu = {
  categories: [
    {
      id: "cat-combos",
      name: "Combos",
      icon: "Fastfood",
      items: [makeCategoryItem(makeMenuItem({ id: "combo-1", displayName: "Deluxe Combo" }))],
    },
    {
      id: "cat-tacos",
      name: "Tacos",
      icon: "LunchDining",
      items: [
        makeCategoryItem(
          makeMenuItem({
            id: "taco-1",
            displayName: "Crunchy Taco Deluxe",
            basePriceCents: 199,
            sizes: [],
            options: [],
            modifiers: [],
          }),
          { id: "ci-taco", name: "Crunchy Taco" },
        ),
      ],
    },
  ],
};

function newClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithProviders(ui: React.ReactElement, client: QueryClient = newClient()) {
  render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
  useCartStore.getState().clear();
  useAuthStore.setState({
    sessionToken: "session-1",
    employee: { id: "E1", name: "Tester" },
    isAuthenticated: true,
  });
});

// --- ItemConfigurator -------------------------------------------------------

describe("ItemConfigurator", () => {
  it("prompts to pick an item when none is selected", () => {
    renderWithProviders(<ItemConfigurator categoryItem={null} />);
    expect(screen.getByText("Select an item to configure.")).toBeInTheDocument();
  });

  it("renders size, option and modifier sections with the default size selected", () => {
    renderWithProviders(<ItemConfigurator categoryItem={makeCategoryItem(makeMenuItem())} />);

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Options")).toBeInTheDocument();
    expect(screen.getByText("Modifiers")).toBeInTheDocument();
    // "Small" is the default size and starts pressed.
    expect(screen.getByRole("button", { name: "Small" })).toHaveAttribute("aria-pressed", "true");
  });

  it("adds a line item at the base price with default selections", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemConfigurator categoryItem={makeCategoryItem(makeMenuItem())} />);

    await user.click(screen.getByRole("button", { name: /Add to Order/ }));

    const lines = useCartStore.getState().lineItems;
    expect(lines).toHaveLength(1);
    expect(lines[0].unitPriceCents).toBe(500);
    expect(lines[0].appliedModifiers).toEqual([]);
  });

  it("reflects size and modifier selections in the added line", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemConfigurator categoryItem={makeCategoryItem(makeMenuItem())} />);

    await user.click(screen.getByRole("button", { name: /Large/ }));
    await user.click(screen.getByRole("button", { name: /Extra Cheese/ }));
    await user.click(screen.getByRole("button", { name: /Add to Order/ }));

    const line = useCartStore.getState().lineItems[0];
    expect(line.unitPriceCents).toBe(630); // 500 + 80 (Large) + 50 (Extra Cheese)
    expect(line.appliedModifiers).toEqual([{ name: "Extra Cheese", priceModifierCents: 50 }]);
  });

  it("multiplies the line total by the chosen quantity", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemConfigurator categoryItem={makeCategoryItem(makeMenuItem())} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: /Add to Order/ }));

    const line = useCartStore.getState().lineItems[0];
    expect(line.quantity).toBe(2);
    expect(line.lineTotalCents).toBe(1000);
  });
});

// --- OrderSummary -----------------------------------------------------------

describe("OrderSummary", () => {
  it("shows an empty message and disables 'Go to Payment' when the cart is empty", () => {
    renderWithProviders(<OrderSummary onGoToPayment={() => {}} />);

    expect(screen.getByText("No items yet. Build an order from the menu.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to Payment" })).toBeDisabled();
  });

  it("lists line items with modifiers and the running total", () => {
    useCartStore.getState().addLineItem(
      makeLineItem("l1", {
        displayName: "Deluxe Combo",
        quantity: 2,
        unitPriceCents: 550,
        lineTotalCents: 1100,
        appliedModifiers: [{ name: "Extra Cheese", priceModifierCents: 50 }],
      }),
    );

    renderWithProviders(<OrderSummary onGoToPayment={() => {}} />);

    expect(screen.getByText("2× Deluxe Combo")).toBeInTheDocument();
    expect(screen.getByText("Extra Cheese")).toBeInTheDocument();
    // Line total, subtotal and total all read $11.00 for this single line.
    expect(screen.getAllByText("$11.00")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Go to Payment" })).toBeEnabled();
  });

  it("removes a line item when its remove button is clicked", async () => {
    const user = userEvent.setup();
    useCartStore.getState().addLineItem(makeLineItem("l1", { displayName: "Deluxe Combo" }));

    renderWithProviders(<OrderSummary onGoToPayment={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Remove Deluxe Combo" }));

    expect(useCartStore.getState().lineItems).toHaveLength(0);
  });

  it("invokes onGoToPayment when the button is pressed", async () => {
    const user = userEvent.setup();
    const onGoToPayment = vi.fn();
    useCartStore.getState().addLineItem(makeLineItem("l1"));

    renderWithProviders(<OrderSummary onGoToPayment={onGoToPayment} />);
    await user.click(screen.getByRole("button", { name: "Go to Payment" }));

    expect(onGoToPayment).toHaveBeenCalledOnce();
  });
});

// --- PaymentPanel -----------------------------------------------------------

describe("PaymentPanel", () => {
  function seedCart(totalCents = 520) {
    useCartStore.getState().addLineItem(
      makeLineItem("l1", { unitPriceCents: totalCents, lineTotalCents: totalCents }),
    );
  }

  it("keeps 'Complete Order' disabled until the order is fully paid", () => {
    seedCart(520);
    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={() => {}} />);

    expect(screen.getByRole("button", { name: "Complete Order" })).toBeDisabled();
  });

  it("keeps 'Submit Payment' disabled until an amount is entered", async () => {
    const user = userEvent.setup();
    seedCart(520);
    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={() => {}} />);

    const submit = screen.getByRole("button", { name: "Submit Payment" });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(submit).toBeEnabled();
  });

  it("records a payment entered on the number pad as whole cents", async () => {
    const user = userEvent.setup();
    seedCart(520);
    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={() => {}} />);

    // Key "5" "2" "0" → $5.20.
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Submit Payment" }));

    const s = useCartStore.getState();
    expect(s.payments).toHaveLength(1);
    expect(s.payments[0].amountCents).toBe(520);
    expect(s.payments[0].method).toBe("Card");
    expect(s.isFullyPaid).toBe(true);
  });

  it("caps the entry at the remaining balance to prevent overpayment", async () => {
    const user = userEvent.setup();
    seedCart(520); // remaining balance is $5.20
    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={() => {}} />);

    // Keying "9" "9" "9" would be $9.99 but must clamp to the $5.20 remaining.
    await user.click(screen.getByRole("button", { name: "9" }));
    await user.click(screen.getByRole("button", { name: "9" }));
    await user.click(screen.getByRole("button", { name: "9" }));
    await user.click(screen.getByRole("button", { name: "Submit Payment" }));

    const s = useCartStore.getState();
    expect(s.payments).toHaveLength(1);
    expect(s.payments[0].amountCents).toBe(520);
    expect(s.remainingCents).toBe(0);
    expect(s.isFullyPaid).toBe(true);
  });

  it("caps a partial payment entry at the balance left after prior payments", async () => {
    const user = userEvent.setup();
    seedCart(520);
    // A $2.00 payment already applied leaves $3.20 remaining.
    useCartStore.getState().addPayment({
      id: "p-prior",
      method: "Cash",
      amountCents: 200,
      createdAt: "2026-07-09T12:00:00.000Z",
    });
    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={() => {}} />);

    // Keying "5" "0" "0" ($5.00) must clamp to the $3.20 remaining.
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Submit Payment" }));

    const s = useCartStore.getState();
    expect(s.paidCents).toBe(520);
    expect(s.payments[1].amountCents).toBe(320);
    expect(s.remainingCents).toBe(0);
  });

  it("completes the order with the mapped request, then clears the cart", async () => {
    const user = userEvent.setup();
    seedCart(520);
    const created: Order = {
      id: "1050",
      employeeId: "E1",
      createdAt: "2026-07-09T12:00:00.000Z",
      status: "Kitchen",
      lineItems: [],
      payments: [],
      subtotalCents: 520,
      totalCents: 520,
    };
    mockedOrders.createOrder.mockResolvedValue(created);
    const onCompleted = vi.fn();

    renderWithProviders(<PaymentPanel onBack={() => {}} onCompleted={onCompleted} />);

    // Pay the full amount so "Complete Order" enables.
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "0" }));
    await user.click(screen.getByRole("button", { name: "Submit Payment" }));
    await user.click(screen.getByRole("button", { name: "Complete Order" }));

    await waitFor(() => expect(onCompleted).toHaveBeenCalledOnce());

    // TanStack Query passes a context object as the 2nd arg, so assert the 1st.
    expect(mockedOrders.createOrder.mock.calls[0][0]).toEqual({
      employeeId: "E1",
      lineItems: [
        {
          menuItemId: "combo-1",
          quantity: 1,
          selectedSizeId: undefined,
          selectedOptionIds: [],
          selectedModifierIds: [],
        },
      ],
      payments: [{ method: "Card", amountCents: 520 }],
    });
    expect(useCartStore.getState().lineItems).toHaveLength(0);
  });

  it("calls onBack when the back button is pressed", async () => {
    const user = userEvent.setup();
    seedCart();
    const onBack = vi.fn();
    renderWithProviders(<PaymentPanel onBack={onBack} onCompleted={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

// --- OrderingScreen ---------------------------------------------------------

describe("OrderingScreen", () => {
  it("shows a loading state while the menu loads", () => {
    mockedMenu.getMenu.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<OrderingScreen />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("shows an error state when the menu fails to load", async () => {
    mockedMenu.getMenu.mockRejectedValue(new Error("boom"));
    renderWithProviders(<OrderingScreen />);
    expect(await screen.findByText("Failed to load menu")).toBeInTheDocument();
  });

  it("renders categories and defaults to the first category's items", async () => {
    mockedMenu.getMenu.mockResolvedValue(seedMenu);
    renderWithProviders(<OrderingScreen />);

    expect(await screen.findByRole("button", { name: "Combos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tacos" })).toBeInTheDocument();
    // First category ("Combos") is active by default → its item is listed.
    expect(screen.getByRole("button", { name: "Combo #1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Crunchy Taco" })).not.toBeInTheDocument();
  });

  it("switches the item list when another category is selected", async () => {
    const user = userEvent.setup();
    mockedMenu.getMenu.mockResolvedValue(seedMenu);
    renderWithProviders(<OrderingScreen />);

    await user.click(await screen.findByRole("button", { name: "Tacos" }));

    expect(screen.getByRole("button", { name: "Crunchy Taco" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Combo #1" })).not.toBeInTheDocument();
  });

  it("configures an item, adds it to the order, and moves to payment", async () => {
    const user = userEvent.setup();
    mockedMenu.getMenu.mockResolvedValue(seedMenu);
    renderWithProviders(<OrderingScreen />);

    // Select the first category's item → configurator shows it.
    await user.click(await screen.findByRole("button", { name: "Combo #1" }));
    expect(await screen.findByRole("heading", { name: "Deluxe Combo" })).toBeInTheDocument();

    // Add to order → it appears in the summary and enables payment.
    await user.click(screen.getByRole("button", { name: /Add to Order/ }));
    expect(useCartStore.getState().lineItems).toHaveLength(1);

    const goToPayment = screen.getByRole("button", { name: "Go to Payment" });
    expect(goToPayment).toBeEnabled();
    await user.click(goToPayment);

    // Pane 3 switches to payment mode.
    expect(screen.getByRole("button", { name: "Submit Payment" })).toBeInTheDocument();
  });
});

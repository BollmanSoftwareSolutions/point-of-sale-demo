import { useCartStore } from "../stores/cartStore";
import type { OrderLineItem, Payment } from "../types";

// --- Fixtures ---------------------------------------------------------------

function makeLineItem(id: string, unitPriceCents: number, quantity = 1): OrderLineItem {
  return {
    id,
    menuItemId: "menu-1",
    displayName: "Crunchy Taco",
    quantity,
    selectedOptionIds: [],
    selectedModifierIds: [],
    appliedModifiers: [],
    unitPriceCents,
    lineTotalCents: unitPriceCents * quantity,
  };
}

function makePayment(id: string, amountCents: number): Payment {
  return { id, method: "Card", amountCents, createdAt: "2026-07-09T12:00:00.000Z" };
}

// The store is a singleton; reset it before each test.
beforeEach(() => {
  useCartStore.getState().clear();
});

describe("cartStore", () => {
  it("starts empty with zeroed totals and not fully paid", () => {
    const s = useCartStore.getState();
    expect(s.lineItems).toEqual([]);
    expect(s.payments).toEqual([]);
    expect(s.subtotalCents).toBe(0);
    expect(s.totalCents).toBe(0);
    expect(s.paidCents).toBe(0);
    expect(s.remainingCents).toBe(0);
    expect(s.isFullyPaid).toBe(false);
  });

  it("adding line items updates subtotal and total", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 500));
    useCartStore.getState().addLineItem(makeLineItem("l2", 250, 2));

    const s = useCartStore.getState();
    expect(s.subtotalCents).toBe(1000); // 500 + 250*2
    expect(s.totalCents).toBe(1000);
    expect(s.remainingCents).toBe(1000);
  });

  it("adding payments reduces the remaining balance", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 1000));
    useCartStore.getState().addPayment(makePayment("p1", 400));

    const s = useCartStore.getState();
    expect(s.paidCents).toBe(400);
    expect(s.remainingCents).toBe(600);
    expect(s.isFullyPaid).toBe(false);
  });

  it("clamps remaining to zero when overpaid and marks fully paid", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 1000));
    useCartStore.getState().addPayment(makePayment("p1", 600));
    useCartStore.getState().addPayment(makePayment("p2", 600));

    const s = useCartStore.getState();
    expect(s.paidCents).toBe(1200);
    expect(s.remainingCents).toBe(0);
    expect(s.isFullyPaid).toBe(true);
  });

  it("is never fully paid when the cart is empty", () => {
    // paid (0) >= total (0) but there is nothing to buy.
    expect(useCartStore.getState().isFullyPaid).toBe(false);
  });

  it("updating a line quantity recomputes its line total", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 300));
    useCartStore.getState().updateLineItemQuantity("l1", 4);

    const s = useCartStore.getState();
    expect(s.lineItems[0].quantity).toBe(4);
    expect(s.lineItems[0].lineTotalCents).toBe(1200);
    expect(s.subtotalCents).toBe(1200);
  });

  it("removes a line item when its quantity drops to zero", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 300));
    useCartStore.getState().updateLineItemQuantity("l1", 0);

    expect(useCartStore.getState().lineItems).toEqual([]);
    expect(useCartStore.getState().subtotalCents).toBe(0);
  });

  it("removes a specific line item and payment by id", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 300));
    useCartStore.getState().addLineItem(makeLineItem("l2", 700));
    useCartStore.getState().addPayment(makePayment("p1", 100));

    useCartStore.getState().removeLineItem("l1");
    useCartStore.getState().removePayment("p1");

    const s = useCartStore.getState();
    expect(s.lineItems.map((li) => li.id)).toEqual(["l2"]);
    expect(s.payments).toEqual([]);
    expect(s.subtotalCents).toBe(700);
    expect(s.paidCents).toBe(0);
  });

  it("clear() resets line items, payments and derived totals", () => {
    useCartStore.getState().addLineItem(makeLineItem("l1", 500));
    useCartStore.getState().addPayment(makePayment("p1", 500));

    useCartStore.getState().clear();

    const s = useCartStore.getState();
    expect(s.lineItems).toEqual([]);
    expect(s.payments).toEqual([]);
    expect(s.subtotalCents).toBe(0);
    expect(s.paidCents).toBe(0);
    expect(s.isFullyPaid).toBe(false);
  });
});

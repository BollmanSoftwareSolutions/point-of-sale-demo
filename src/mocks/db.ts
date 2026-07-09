// In-memory mock store + query/mutation helpers (seeded once at startup).
// See design-docs/04-api-contract.md (MSW Implementation Notes).
//
// No persistence: this module is re-evaluated on every page load, restoring a
// clean, deterministic dataset. Mutations update the arrays below so subsequent
// reads (History, Kitchen) reflect changes within the session.

import type {
  AppliedModifier,
  Employee,
  Menu,
  MenuItem,
  Order,
  OrderLineItem,
  OrderStatus,
  Payment,
} from "../types";
import type {
  CreateOrderRequest,
  OrderSearchQuery,
  OrderSearchResponse,
  OrderSummaryRow,
} from "../api/orders";
import { seedMenu } from "./seed/menu";
import { seedEmployees } from "./seed/employees";
import { seedOrders } from "./seed/orders";

// --- Error / result plumbing -------------------------------------------------

export interface DbError {
  status: number; // HTTP status the handler should return
  code: string; // machine-readable error code (see API contract)
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: DbError };

function fail(status: number, code: string, message: string): { ok: false; error: DbError } {
  return { ok: false, error: { status, code, message } };
}

// --- Store -------------------------------------------------------------------

const menu: Menu = seedMenu;
const employees: Employee[] = seedEmployees;
const orders: Order[] = [...seedOrders];

// Flat index of every configurable product by id, for price recomputation.
const menuItemIndex = new Map<string, MenuItem>();
for (const category of menu.categories) {
  for (const categoryItem of category.items) {
    for (const item of categoryItem.items) {
      menuItemIndex.set(item.id, item);
    }
  }
}

// --- Helpers -----------------------------------------------------------------

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

function toSummaryRow(order: Order): OrderSummaryRow {
  const names = order.lineItems.map((li) => li.displayName).join(", ");
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    itemsPreview: truncate(names, 30),
  };
}

function nextOrderId(): string {
  const max = orders.reduce((highest, o) => Math.max(highest, Number(o.id) || 0), 1000);
  return String(max + 1);
}

function isTransitionAllowed(from: OrderStatus, to: "Fulfilled" | "Refunded"): boolean {
  if (to === "Fulfilled") return from === "Kitchen";
  // Refunds allowed from Kitchen or Fulfilled (not from an already-Refunded order).
  return from === "Kitchen" || from === "Fulfilled";
}

// --- Menu --------------------------------------------------------------------

export function getMenu(): Menu {
  return menu;
}

// --- Employees / auth --------------------------------------------------------

export function employeeExists(id: string): boolean {
  return employees.some((e) => e.id.toUpperCase() === id.toUpperCase());
}

export function verifyLogin(employeeId: string, pin: string): Result<Employee> {
  const employee = employees.find((e) => e.id.toUpperCase() === employeeId.toUpperCase());
  if (!employee) return fail(404, "employee_not_found", "Employee not found");
  if (employee.pin !== pin) return fail(401, "invalid_pin", "Incorrect PIN");
  return { ok: true, value: employee };
}

// --- Orders: read ------------------------------------------------------------

export function searchOrders(query: OrderSearchQuery): OrderSearchResponse {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 10;

  let list = orders.slice();

  if (query.status) {
    list = list.filter((o) => o.status === query.status);
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.lineItems.some((li) => li.displayName.toLowerCase().includes(q)),
    );
  }

  if (query.from) {
    const fromTs = Date.parse(query.from);
    if (!Number.isNaN(fromTs)) list = list.filter((o) => Date.parse(o.createdAt) >= fromTs);
  }

  if (query.to) {
    let toTs = Date.parse(query.to);
    if (!Number.isNaN(toTs)) {
      // Date-only "to" (YYYY-MM-DD) should include the whole day.
      if (query.to.length <= 10) toTs += 24 * 60 * 60 * 1000 - 1;
      list = list.filter((o) => Date.parse(o.createdAt) <= toTs);
    }
  }

  // History is newest → oldest; the Kitchen board wants oldest → newest (build order).
  const ascending = query.status === "Kitchen";
  list.sort((a, b) => {
    const cmp = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    return ascending ? cmp : -cmp;
  });

  const total = list.length;
  const start = (page - 1) * pageSize;
  const results = list.slice(start, start + pageSize).map(toSummaryRow);

  return { results, page, pageSize, total };
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

// --- Orders: create ----------------------------------------------------------

export function createOrder(req: CreateOrderRequest): Result<Order> {
  const id = nextOrderId();
  const createdAt = new Date().toISOString();
  const lineItems: OrderLineItem[] = [];

  for (let i = 0; i < req.lineItems.length; i++) {
    const line = req.lineItems[i];
    const item = menuItemIndex.get(line.menuItemId);
    if (!item) return fail(422, "invalid_line_item", `Unknown menu item: ${line.menuItemId}`);

    let unitPriceCents = item.basePriceCents;

    if (line.selectedSizeId) {
      const size = item.sizes.find((s) => s.id === line.selectedSizeId);
      if (!size)
        return fail(422, "invalid_line_item", `Unknown size ${line.selectedSizeId} for ${item.id}`);
      unitPriceCents += size.priceModifierCents;
    }

    for (const optionId of line.selectedOptionIds) {
      const option = item.options.find((o) => o.id === optionId);
      if (!option)
        return fail(422, "invalid_line_item", `Unknown option ${optionId} for ${item.id}`);
      unitPriceCents += option.priceModifierCents;
    }

    const appliedModifiers: AppliedModifier[] = [];
    for (const modifierId of line.selectedModifierIds) {
      const modifier = item.modifiers.find((m) => m.id === modifierId);
      if (!modifier)
        return fail(422, "invalid_line_item", `Unknown modifier ${modifierId} for ${item.id}`);
      unitPriceCents += modifier.priceModifierCents;
      appliedModifiers.push({ name: modifier.name, priceModifierCents: modifier.priceModifierCents });
    }

    const quantity = line.quantity > 0 ? line.quantity : 1;
    lineItems.push({
      id: `${id}-L${i + 1}`,
      menuItemId: item.id,
      displayName: item.displayName,
      quantity,
      selectedSizeId: line.selectedSizeId,
      selectedOptionIds: line.selectedOptionIds,
      selectedModifierIds: line.selectedModifierIds,
      appliedModifiers,
      unitPriceCents,
      lineTotalCents: unitPriceCents * quantity,
    });
  }

  const subtotalCents = lineItems.reduce((sum, li) => sum + li.lineTotalCents, 0);
  const totalCents = subtotalCents;

  const paidCents = req.payments.reduce((sum, p) => sum + p.amountCents, 0);
  if (paidCents < totalCents) {
    return fail(422, "insufficient_payment", "Payments do not cover the order total");
  }

  const payments: Payment[] = req.payments.map((p, i) => ({
    id: `${id}-P${i + 1}`,
    method: p.method,
    amountCents: p.amountCents,
    createdAt,
  }));

  const order: Order = {
    id,
    employeeId: req.employeeId,
    createdAt,
    status: "Kitchen",
    lineItems,
    payments,
    subtotalCents,
    totalCents,
  };

  orders.push(order);
  return { ok: true, value: order };
}

// --- Orders: status transitions ---------------------------------------------

export function updateOrderStatus(
  id: string,
  status: "Fulfilled" | "Refunded",
): Result<Order> {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return fail(404, "order_not_found", "Order not found");

  const current = orders[index];
  if (!isTransitionAllowed(current.status, status)) {
    return fail(409, "invalid_transition", `Cannot change ${current.status} → ${status}`);
  }

  const updated: Order = { ...current, status };
  orders[index] = updated;
  return { ok: true, value: updated };
}

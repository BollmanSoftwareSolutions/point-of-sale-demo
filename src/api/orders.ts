// Orders data-access: search, detail, create, status update.
// See design-docs/04-api-contract.md (Orders section).

import type { Order, OrderStatus, PaymentMethod } from "../types";

export interface OrderSearchQuery {
  q?: string;
  from?: string; // ISO date (inclusive)
  to?: string; // ISO date (inclusive)
  status?: OrderStatus;
  page?: number; // 1-based
  pageSize?: number; // default 10
}

export interface OrderSummaryRow {
  id: string;
  createdAt: string;
  status: OrderStatus;
  itemsPreview: string; // comma-joined item names, truncated at 30 chars
}

export interface OrderSearchResponse {
  results: OrderSummaryRow[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreateOrderLineItem {
  menuItemId: string;
  quantity: number;
  selectedSizeId?: string;
  selectedOptionIds: string[];
  selectedModifierIds: string[];
}

export interface CreatePayment {
  method: PaymentMethod;
  amountCents: number;
}

export interface CreateOrderRequest {
  employeeId: string;
  lineItems: CreateOrderLineItem[];
  payments: CreatePayment[];
}

// TODO: GET /api/orders
export async function searchOrders(_query: OrderSearchQuery): Promise<OrderSearchResponse> {
  throw new Error("Not implemented");
}

// TODO: GET /api/orders/:id
export async function getOrder(_id: string): Promise<Order> {
  throw new Error("Not implemented");
}

// TODO: POST /api/orders
export async function createOrder(_req: CreateOrderRequest): Promise<Order> {
  throw new Error("Not implemented");
}

// TODO: PATCH /api/orders/:id/status
export async function updateOrderStatus(
  _id: string,
  _status: "Fulfilled" | "Refunded",
): Promise<Order> {
  throw new Error("Not implemented");
}

// Orders data-access: search, detail, create, status update.
// See design-docs/04-api-contract.md (Orders section).

import { apiFetch } from "./client";
import type { Order, OrderStatus, PaymentMethod } from "../types";

export interface OrderSearchQuery {
  q?: string;
  from?: string; // ISO date (inclusive)
  to?: string; // ISO date (inclusive)
  status?: OrderStatus;
  sort?: "asc" | "desc"; // by createdAt; default "desc" (newest first)
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

// GET /api/orders
export async function searchOrders(query: OrderSearchQuery): Promise<OrderSearchResponse> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.status) params.set("status", query.status);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return apiFetch<OrderSearchResponse>(`/orders${qs ? `?${qs}` : ""}`);
}

// GET /api/orders/:id
export async function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${encodeURIComponent(id)}`);
}

// TODO: POST /api/orders
export async function createOrder(_req: CreateOrderRequest): Promise<Order> {
  throw new Error("Not implemented");
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(
  id: string,
  status: "Fulfilled" | "Refunded",
): Promise<Order> {
  return apiFetch<Order>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// MSW request handlers — implements design-docs/04-api-contract.md.
//
// All endpoints are served from the in-memory store in ./db. A small artificial
// delay is added so client loading states are visible.

import { http, HttpResponse, delay } from "msw";
import * as db from "./db";
import type { DbError } from "./db";
import type { LoginRequest } from "../api/auth";
import type { CreateOrderRequest, OrderSearchQuery } from "../api/orders";
import type { OrderStatus } from "../types";

const API = "/api";

async function latency(): Promise<void> {
  await delay(150 + Math.floor(Math.random() * 250)); // ~150–400ms
}

function errorResponse(error: DbError) {
  return HttpResponse.json(
    { error: { code: error.code, message: error.message } },
    { status: error.status },
  );
}

export const handlers = [
  // --- Auth ------------------------------------------------------------------
  http.post(`${API}/auth/login`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as LoginRequest;
    const result = db.verifyLogin(body.employeeId, body.pin);
    if (!result.ok) return errorResponse(result.error);
    return HttpResponse.json({
      sessionToken: `session-${crypto.randomUUID()}`,
      employee: { id: result.value.id, name: result.value.name },
    });
  }),

  http.get(`${API}/employees/:id/exists`, async ({ params }) => {
    await latency();
    return HttpResponse.json({ exists: db.employeeExists(String(params.id)) });
  }),

  // --- Menu ------------------------------------------------------------------
  http.get(`${API}/menu`, async () => {
    await latency();
    return HttpResponse.json(db.getMenu());
  }),

  // --- Orders ----------------------------------------------------------------
  http.get(`${API}/orders`, async ({ request }) => {
    await latency();
    const params = new URL(request.url).searchParams;
    const pageParam = params.get("page");
    const pageSizeParam = params.get("pageSize");
    const query: OrderSearchQuery = {
      q: params.get("q") ?? undefined,
      from: params.get("from") ?? undefined,
      to: params.get("to") ?? undefined,
      status: (params.get("status") as OrderStatus | null) ?? undefined,
      page: pageParam ? Number(pageParam) : undefined,
      pageSize: pageSizeParam ? Number(pageSizeParam) : undefined,
    };
    return HttpResponse.json(db.searchOrders(query));
  }),

  http.get(`${API}/orders/:id`, async ({ params }) => {
    await latency();
    const order = db.getOrder(String(params.id));
    if (!order) {
      return errorResponse({ status: 404, code: "order_not_found", message: "Order not found" });
    }
    return HttpResponse.json(order);
  }),

  http.post(`${API}/orders`, async ({ request }) => {
    await latency();
    const body = (await request.json()) as CreateOrderRequest;
    const result = db.createOrder(body);
    if (!result.ok) return errorResponse(result.error);
    return HttpResponse.json(result.value, { status: 201 });
  }),

  http.patch(`${API}/orders/:id/status`, async ({ params, request }) => {
    await latency();
    const body = (await request.json()) as { status: "Fulfilled" | "Refunded" };
    const result = db.updateOrderStatus(String(params.id), body.status);
    if (!result.ok) return errorResponse(result.error);
    return HttpResponse.json(result.value);
  }),

  // --- Payments (mock external processor) ------------------------------------
  http.post(`${API}/payments/authorize`, async () => {
    await latency();
    return HttpResponse.json({ approved: true, authCode: `AUTH-${crypto.randomUUID()}` });
  }),
];

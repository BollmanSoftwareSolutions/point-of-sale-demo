# API / Mock Service Contract

> Companion to [features.md](features.md). Defines the "network" contract that
> the app codes against and that **MSW** implements over
> [in-memory seed data](02-data-models.md#6-seed-data-requirements).
>
> All endpoints are simulated by MSW handlers in the browser. There is no real
> server. Base path: `/api`.

## Conventions

- **Format:** JSON request/response bodies.
- **Money:** integer cents everywhere (see [data models](02-data-models.md#money)).
- **Errors:** non-2xx responses return `{ "error": { "code": string, "message": string } }`.
- **Latency:** handlers add a small artificial delay (~150–400ms) so loading
  states are visible.
- **Auth:** demo-only. A successful login returns a `sessionToken` (opaque
  string); the client sends it via `Authorization: Bearer <token>` on subsequent
  calls. Handlers accept any non-empty token (no real verification).

---

## Auth

### `POST /api/auth/login`
Two-step login is represented as a single verify-credentials call driven by the
UI state machine (id first, then PIN). The client calls this once it has both.

Request:
```ts
interface LoginRequest {
  employeeId: string; // 6 chars [0-9A-D]
  pin: string;        // 4 digits [0-9]
}
```

Responses:
- `200 OK`
  ```ts
  interface LoginResponse {
    sessionToken: string;
    employee: { id: string; name: string };
  }
  ```
- `404 employee_not_found` — no employee with that id (drives the id-field error).
- `401 invalid_pin` — id valid but PIN wrong (drives the PIN-field error).

> The UI validates the id step by attempting a lightweight lookup; to keep the
> two-step UX (id error vs PIN error) crisp, `GET /api/employees/:id/exists`
> may be used for the first step.

### `GET /api/employees/:id/exists`
- `200 OK` → `{ "exists": boolean }`. Backs the id-first validation step.

---

## Menu

### `GET /api/menu`
Returns the full nested menu (Pane 1 → 2 → 3 source).

- `200 OK` → `Menu` (see [data models §1](02-data-models.md#1-menu)).

Cached indefinitely on the client (`staleTime: Infinity`) — menu is static seed
data.

---

## Orders

### `GET /api/orders`
Search/list for the Order History grid. Newest → oldest.

Query params:
```ts
interface OrderSearchQuery {
  q?: string;        // free text (matches item names / order id)
  from?: string;     // ISO date (inclusive)
  to?: string;       // ISO date (inclusive)
  status?: OrderStatus;
  sort?: "asc" | "desc"; // by createdAt; default "desc" (newest first)
  page?: number;     // 1-based
  pageSize?: number; // default 10 (History shows 10 rows)
}
```

Response:
```ts
interface OrderSearchResponse {
  results: OrderSummaryRow[];
  page: number;
  pageSize: number;
  total: number;     // total matching orders (for pagination)
}

interface OrderSummaryRow {
  id: string;
  createdAt: string;
  status: OrderStatus;
  itemsPreview: string; // comma-joined item names (full list; grid clips with an ellipsis)
}
```

### `GET /api/orders/:id`
Full order for the History detail panel and receipts.

- `200 OK` → `Order` (see [data models §3](02-data-models.md#3-order)).
- `404 order_not_found`.

### `GET /api/orders?status=Kitchen`
Used by the **Kitchen board** (via the same list endpoint). The Kitchen query
requests all `Kitchen`-status orders sorted oldest → newest (build order) with
`sort=asc`, and polls on an interval — see
[state & routing](05-state-and-routing.md#kitchen-polling). History always sorts
newest → oldest (the default `sort=desc`), regardless of any status filter.

### `POST /api/orders`
Create a completed order from the cart. Server assigns `id`, `createdAt`, and
sets `status: "Kitchen"`.

Request:
```ts
interface CreateOrderRequest {
  employeeId: string;              // cashier (tags the order)
  lineItems: CreateOrderLineItem[];
  payments: CreatePayment[];
}

interface CreateOrderLineItem {
  menuItemId: string;
  quantity: number;
  selectedSizeId?: string;
  selectedOptionIds: string[];
  selectedModifierIds: string[];
}

interface CreatePayment {
  method: PaymentMethod;
  amountCents: number;
}
```

Server responsibilities:
- Recompute `unitPriceCents` / `lineTotalCents` / `totalCents` from the menu
  (client-sent prices are not trusted).
- Snapshot `displayName` + `appliedModifiers` onto each line item.
- Validate `sum(payments.amountCents) >= totalCents`.

Responses:
- `201 Created` → `Order` (status `Kitchen`).
- `422 insufficient_payment` — payments do not cover the total.
- `422 invalid_line_item` — unknown menu/size/option/modifier id.

### `PATCH /api/orders/:id/status`
State transitions for Kitchen "Completed" and History "Refund".

Request:
```ts
interface UpdateOrderStatusRequest {
  status: "Fulfilled" | "Refunded";
}
```

Responses:
- `200 OK` → updated `Order`.
- `404 order_not_found`.
- `409 invalid_transition` — e.g. refunding an already-refunded order.

Allowed transitions (see [lifecycle](02-data-models.md#5-order-status-lifecycle)):
`Kitchen → Fulfilled`, `Kitchen → Refunded`, `Fulfilled → Refunded`.

---

## Payments (external, mocked)

Per features.md, payment authorization is "handled externally through an API
call". This is mocked; the client submits payments as part of the order rather
than calling a separate processor. If a distinct processor call is desired:

### `POST /api/payments/authorize` *(optional)*
```ts
interface AuthorizePaymentRequest {
  method: PaymentMethod;
  amountCents: number;
}
interface AuthorizePaymentResponse {
  approved: boolean;
  authCode: string;
}
```
Mock always returns `approved: true`. Kept optional to match the "external API"
framing without adding real complexity.

---

## Endpoint Summary

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Verify id + PIN, return session. |
| GET | `/api/employees/:id/exists` | Id-first login validation. |
| GET | `/api/menu` | Full nested menu. |
| GET | `/api/orders` | Search/list (History) + Kitchen filter. |
| GET | `/api/orders/:id` | Full order detail. |
| POST | `/api/orders` | Create order (status → Kitchen). |
| PATCH | `/api/orders/:id/status` | Fulfilled / Refunded transitions. |
| POST | `/api/payments/authorize` | *(optional)* mock external processor. |

## MSW Implementation Notes

- Handlers live in `src/mocks/handlers.ts`; the in-memory store in
  `src/mocks/db.ts` (seeded once at startup — menu, employees, 15 orders).
- Mutations (`POST`/`PATCH`) update the in-memory store so subsequent `GET`s
  (History, Kitchen) reflect changes within the session.
- No persistence: a reload re-seeds a clean deterministic dataset.
- Worker registered in `main.tsx` (`worker.start()`), gated so production build
  still runs the mock (this is a static demo with no backend).

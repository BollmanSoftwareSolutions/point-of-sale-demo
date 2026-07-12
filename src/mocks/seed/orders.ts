// Seed data: 15 mock orders (mixed statuses, date range).
// See design-docs/02-data-models.md §3, §4 & §6.
//
// All amounts are integer cents. Every order is fully paid (an order is only
// saved once payments cover the total), so payments always sum to totalCents.

import type {
  AppliedModifier,
  Order,
  OrderLineItem,
  OrderStatus,
  Payment,
  PaymentMethod,
} from "../../types";

// Timestamps are generated relative to "now" so the seed data always spans the
// same buckets the Order History quick filters use (see timePreset.ts):
//   • Last 4 Hours   • Today   • Last 7 Days   • older than 7 days
// Captured once at module load so every order in a session shares one baseline.
const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function minutesAgo(minutes: number): string {
  return new Date(NOW - minutes * MINUTE).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(NOW - hours * HOUR).toISOString();
}

function daysAgo(days: number): string {
  return new Date(NOW - days * DAY).toISOString();
}

interface LineSpec {
  menuItemId: string;
  displayName: string;
  unitPriceCents: number; // base + selected size/options/modifiers
  quantity?: number; // default 1
  appliedModifiers?: AppliedModifier[];
  selectedSizeId?: string;
  selectedOptionIds?: string[];
  selectedModifierIds?: string[];
}

interface PaymentSpec {
  method: PaymentMethod;
  amountCents?: number; // default: full remaining total (single payment)
}

interface OrderSpec {
  id: string;
  employeeId: string;
  createdAt: string; // ISO-8601
  status: OrderStatus;
  lines: LineSpec[];
  payments?: PaymentSpec[]; // default: one Card payment for the full total
}

function buildOrder(spec: OrderSpec): Order {
  const lineItems: OrderLineItem[] = spec.lines.map((l, i) => {
    const quantity = l.quantity ?? 1;
    return {
      id: `${spec.id}-L${i + 1}`,
      menuItemId: l.menuItemId,
      displayName: l.displayName,
      quantity,
      selectedSizeId: l.selectedSizeId,
      selectedOptionIds: l.selectedOptionIds ?? [],
      selectedModifierIds: l.selectedModifierIds ?? [],
      appliedModifiers: l.appliedModifiers ?? [],
      unitPriceCents: l.unitPriceCents,
      lineTotalCents: l.unitPriceCents * quantity,
    };
  });

  const subtotalCents = lineItems.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const paymentSpecs: PaymentSpec[] = spec.payments ?? [{ method: "Card" }];
  const payments: Payment[] = paymentSpecs.map((p, i) => ({
    id: `${spec.id}-P${i + 1}`,
    method: p.method,
    amountCents: p.amountCents ?? subtotalCents,
    createdAt: spec.createdAt,
  }));

  return {
    id: spec.id,
    employeeId: spec.employeeId,
    createdAt: spec.createdAt,
    status: spec.status,
    lineItems,
    payments,
    subtotalCents,
    totalCents: subtotalCents,
  };
}

const EMP_A = "1A2B3C";
const EMP_B = "4D5C6B";

const guac: AppliedModifier = { name: "Add Guacamole", priceModifierCents: 80 };
const noCheese: AppliedModifier = { name: "No Cheese", priceModifierCents: -30 };
const extraCheese: AppliedModifier = { name: "Extra Cheese", priceModifierCents: 50 };
const extraMeat: AppliedModifier = { name: "Extra Meat", priceModifierCents: 120 };
const sourCream: AppliedModifier = { name: "Add Sour Cream", priceModifierCents: 40 };

const orderSpecs: OrderSpec[] = [
  {
    id: "1015",
    employeeId: EMP_A,
    createdAt: minutesAgo(18), // within 4 hours
    status: "Kitchen",
    lines: [
      { menuItemId: "combo-taco", displayName: "3 Crunchy Tacos Combo", unitPriceCents: 789, selectedSizeId: "size-md" },
      {
        menuItemId: "taco-supreme",
        displayName: "Crunchy Taco Supreme",
        unitPriceCents: 359,
        quantity: 2,
        appliedModifiers: [guac],
        selectedModifierIds: ["mod-guacamole"],
      },
    ],
  },
  {
    id: "1014",
    employeeId: EMP_B,
    createdAt: minutesAgo(52), // within 4 hours
    status: "Kitchen",
    lines: [
      { menuItemId: "burrito-supreme", displayName: "Burrito Supreme", unitPriceCents: 469 },
      { menuItemId: "nachos-bellgrande", displayName: "Nachos BellGrande", unitPriceCents: 549 },
      { menuItemId: "drink-fountain", displayName: "Fountain Drink", unitPriceCents: 259, selectedSizeId: "size-md" },
    ],
    payments: [{ method: "Cash" }],
  },
  {
    id: "1013",
    employeeId: EMP_A,
    createdAt: minutesAgo(115), // within 4 hours
    status: "Kitchen",
    lines: [
      {
        menuItemId: "quesarito",
        displayName: "Quesarito",
        unitPriceCents: 639,
        appliedModifiers: [extraMeat],
        selectedModifierIds: ["mod-extra-meat"],
      },
      { menuItemId: "dessert-churros", displayName: "Churros (4 pc)", unitPriceCents: 269 },
    ],
  },
  {
    id: "1012",
    employeeId: EMP_B,
    createdAt: minutesAgo(165), // within 4 hours
    status: "Kitchen",
    lines: [
      { menuItemId: "taco-crunchy", displayName: "Crunchy Taco", unitPriceCents: 199, quantity: 3 },
      { menuItemId: "drink-horchata", displayName: "Horchata", unitPriceCents: 299 },
    ],
    payments: [{ method: "GiftCertificate" }],
  },
  {
    id: "1011",
    employeeId: EMP_A,
    createdAt: minutesAgo(210), // within 4 hours
    status: "Kitchen",
    lines: [
      { menuItemId: "combo-nachos", displayName: "Nachos BellGrande Combo", unitPriceCents: 909, selectedSizeId: "size-lg" },
    ],
  },
  {
    id: "1010",
    employeeId: EMP_B,
    createdAt: hoursAgo(6), // earlier today (beyond 4 hours)
    status: "Fulfilled",
    lines: [
      { menuItemId: "combo-burrito", displayName: "Burrito Supreme Combo", unitPriceCents: 899 },
      { menuItemId: "taco-soft", displayName: "Soft Taco", unitPriceCents: 209, quantity: 2 },
    ],
  },
  {
    id: "1009",
    employeeId: EMP_A,
    createdAt: hoursAgo(9), // earlier today (beyond 4 hours)
    status: "Fulfilled",
    lines: [
      {
        menuItemId: "nachos-supreme",
        displayName: "Nachos Supreme",
        unitPriceCents: 399,
        appliedModifiers: [noCheese],
        selectedModifierIds: ["mod-no-cheese"],
      },
      { menuItemId: "drink-fountain", displayName: "Fountain Drink", unitPriceCents: 219, selectedSizeId: "size-sm" },
    ],
    payments: [{ method: "Cash" }],
  },
  {
    id: "1008",
    employeeId: EMP_B,
    createdAt: daysAgo(2), // within last 7 days
    status: "Refunded",
    lines: [
      { menuItemId: "burrito-bean", displayName: "Bean Burrito", unitPriceCents: 249, quantity: 2 },
      { menuItemId: "dessert-twists", displayName: "Cinnamon Twists", unitPriceCents: 149 },
    ],
  },
  {
    id: "1007",
    employeeId: EMP_A,
    createdAt: daysAgo(3), // within last 7 days
    status: "Fulfilled",
    lines: [
      { menuItemId: "combo-taco", displayName: "3 Crunchy Tacos Combo", unitPriceCents: 749 },
      { menuItemId: "combo-burrito", displayName: "Burrito Supreme Combo", unitPriceCents: 899 },
      { menuItemId: "drink-water", displayName: "Bottled Water", unitPriceCents: 199, quantity: 2 },
    ],
    // Split payment: cash + card (sums to the 2046 total).
    payments: [
      { method: "Cash", amountCents: 1000 },
      { method: "Card", amountCents: 1046 },
    ],
  },
  {
    id: "1006",
    employeeId: EMP_B,
    createdAt: daysAgo(4), // within last 7 days
    status: "Fulfilled",
    lines: [
      {
        menuItemId: "taco-supreme",
        displayName: "Crunchy Taco Supreme",
        unitPriceCents: 329,
        appliedModifiers: [extraCheese],
        selectedModifierIds: ["mod-extra-cheese"],
      },
      { menuItemId: "nachos", displayName: "Nachos & Cheese", unitPriceCents: 229 },
    ],
  },
  {
    id: "1005",
    employeeId: EMP_A,
    createdAt: daysAgo(5), // within last 7 days
    status: "Fulfilled",
    lines: [
      { menuItemId: "quesarito", displayName: "Quesarito", unitPriceCents: 519 },
      { menuItemId: "drink-horchata", displayName: "Horchata", unitPriceCents: 299 },
      { menuItemId: "dessert-churros", displayName: "Churros (4 pc)", unitPriceCents: 269 },
    ],
    payments: [{ method: "GiftCertificate" }],
  },
  {
    id: "1004",
    employeeId: EMP_B,
    createdAt: daysAgo(6), // within last 7 days
    status: "Refunded",
    lines: [
      { menuItemId: "combo-nachos", displayName: "Nachos BellGrande Combo", unitPriceCents: 829 },
    ],
  },
  {
    id: "1003",
    employeeId: EMP_A,
    createdAt: daysAgo(9), // older than 7 days
    status: "Fulfilled",
    lines: [
      { menuItemId: "taco-crunchy", displayName: "Crunchy Taco", unitPriceCents: 199, quantity: 4 },
      { menuItemId: "drink-fountain", displayName: "Fountain Drink", unitPriceCents: 259, selectedSizeId: "size-md" },
    ],
    payments: [{ method: "Cash" }],
  },
  {
    id: "1002",
    employeeId: EMP_B,
    createdAt: daysAgo(12), // older than 7 days
    status: "Fulfilled",
    lines: [
      {
        menuItemId: "burrito-supreme",
        displayName: "Burrito Supreme",
        unitPriceCents: 499,
        selectedOptionIds: ["opt-chicken"],
      },
      { menuItemId: "dessert-twists", displayName: "Cinnamon Twists", unitPriceCents: 149, quantity: 2 },
    ],
  },
  {
    id: "1001",
    employeeId: EMP_A,
    createdAt: daysAgo(20), // older than 7 days
    status: "Fulfilled",
    lines: [
      { menuItemId: "nachos-bellgrande", displayName: "Nachos BellGrande", unitPriceCents: 549 },
      {
        menuItemId: "taco-soft",
        displayName: "Soft Taco",
        unitPriceCents: 249,
        appliedModifiers: [sourCream],
        selectedModifierIds: ["mod-sour-cream"],
      },
      { menuItemId: "drink-water", displayName: "Bottled Water", unitPriceCents: 199 },
    ],
    payments: [{ method: "Cash" }],
  },
];

export const seedOrders: Order[] = orderSpecs.map(buildOrder);

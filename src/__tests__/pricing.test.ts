import {
  buildAppliedModifiers,
  buildLineItem,
  computeUnitPriceCents,
} from "../lib/pricing";
import type { MenuItem } from "../types";

// --- Fixture ----------------------------------------------------------------

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
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
      { id: "m-no-onion", name: "No Onion", priceModifierCents: 0 },
      { id: "m-guac", name: "Add Guacamole", priceModifierCents: 80 },
    ],
    ...overrides,
  };
}

const noSelection = { selectedOptionIds: [], selectedModifierIds: [] };

// --- computeUnitPriceCents --------------------------------------------------

describe("computeUnitPriceCents", () => {
  it("returns the base price when nothing is selected", () => {
    expect(computeUnitPriceCents(makeItem(), noSelection)).toBe(500);
  });

  it("adds the selected size modifier", () => {
    expect(
      computeUnitPriceCents(makeItem(), { ...noSelection, selectedSizeId: "lg" }),
    ).toBe(580);
  });

  it("adds each selected option modifier", () => {
    expect(
      computeUnitPriceCents(makeItem(), { ...noSelection, selectedOptionIds: ["opt-rings"] }),
    ).toBe(550);
  });

  it("adds each selected modifier (including negatives)", () => {
    const item = makeItem({
      modifiers: [
        { id: "m-cheese", name: "Extra Cheese", priceModifierCents: 50 },
        { id: "m-no-cheese", name: "No Cheese", priceModifierCents: -30 },
      ],
    });
    expect(
      computeUnitPriceCents(item, {
        ...noSelection,
        selectedModifierIds: ["m-cheese", "m-no-cheese"],
      }),
    ).toBe(520);
  });

  it("combines base + size + options + modifiers", () => {
    expect(
      computeUnitPriceCents(makeItem(), {
        selectedSizeId: "lg",
        selectedOptionIds: ["opt-rings"],
        selectedModifierIds: ["m-cheese"],
      }),
    ).toBe(680); // 500 + 80 + 50 + 50
  });

  it("ignores unknown size / option / modifier ids", () => {
    expect(
      computeUnitPriceCents(makeItem(), {
        selectedSizeId: "does-not-exist",
        selectedOptionIds: ["nope"],
        selectedModifierIds: ["missing"],
      }),
    ).toBe(500);
  });
});

// --- buildAppliedModifiers --------------------------------------------------

describe("buildAppliedModifiers", () => {
  it("snapshots the selected modifiers' name + price", () => {
    expect(buildAppliedModifiers(makeItem(), ["m-cheese", "m-guac"])).toEqual([
      { name: "Extra Cheese", priceModifierCents: 50 },
      { name: "Add Guacamole", priceModifierCents: 80 },
    ]);
  });

  it("skips unknown modifier ids", () => {
    expect(buildAppliedModifiers(makeItem(), ["m-cheese", "missing"])).toEqual([
      { name: "Extra Cheese", priceModifierCents: 50 },
    ]);
  });

  it("returns an empty array when nothing is selected", () => {
    expect(buildAppliedModifiers(makeItem(), [])).toEqual([]);
  });
});

// --- buildLineItem ----------------------------------------------------------

describe("buildLineItem", () => {
  it("builds a line item with computed unit and line totals", () => {
    const line = buildLineItem(makeItem(), {
      selectedSizeId: "lg",
      selectedOptionIds: ["opt-rings"],
      selectedModifierIds: ["m-cheese"],
      quantity: 3,
    });

    expect(line.menuItemId).toBe("combo-1");
    expect(line.displayName).toBe("Test Combo");
    expect(line.unitPriceCents).toBe(680);
    expect(line.lineTotalCents).toBe(2040); // 680 * 3
    expect(line.quantity).toBe(3);
    expect(line.selectedSizeId).toBe("lg");
    expect(line.selectedOptionIds).toEqual(["opt-rings"]);
    expect(line.selectedModifierIds).toEqual(["m-cheese"]);
  });

  it("snapshots only the modifiers into appliedModifiers", () => {
    const line = buildLineItem(makeItem(), {
      selectedSizeId: "lg",
      selectedOptionIds: ["opt-rings"],
      selectedModifierIds: ["m-guac"],
      quantity: 1,
    });

    // Size / option are priced in but not listed as applied modifiers.
    expect(line.appliedModifiers).toEqual([{ name: "Add Guacamole", priceModifierCents: 80 }]);
  });

  it("clamps a non-positive quantity to 1", () => {
    const line = buildLineItem(makeItem(), { ...noSelection, quantity: 0 });
    expect(line.quantity).toBe(1);
    expect(line.lineTotalCents).toBe(500);
  });

  it("assigns a unique id to each line", () => {
    const a = buildLineItem(makeItem(), { ...noSelection, quantity: 1 });
    const b = buildLineItem(makeItem(), { ...noSelection, quantity: 1 });
    expect(a.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });
});

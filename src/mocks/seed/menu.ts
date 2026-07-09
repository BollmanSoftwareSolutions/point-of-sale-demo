// Seed data: Mexican fast-food menu.
// See design-docs/02-data-models.md §1 & §6.
//
// Money is integer cents. Modifier/size/option price modifiers are added to the
// item base price. Icon strings are @mui/icons-material component ids.

import type { Menu, MenuModifier } from "../../types";

// Common ingredient modifiers reused across items. Negative values represent
// removing a standard ingredient (shown as e.g. "No Cheese -0.30" in Pane 4).
const commonModifiers: MenuModifier[] = [
  { id: "mod-extra-cheese", name: "Extra Cheese", priceModifierCents: 50 },
  { id: "mod-no-cheese", name: "No Cheese", priceModifierCents: -30 },
  { id: "mod-sour-cream", name: "Add Sour Cream", priceModifierCents: 40 },
  { id: "mod-guacamole", name: "Add Guacamole", priceModifierCents: 80 },
  { id: "mod-extra-meat", name: "Extra Meat", priceModifierCents: 120 },
  { id: "mod-no-onions", name: "No Onions", priceModifierCents: 0 },
  { id: "mod-no-lettuce", name: "No Lettuce", priceModifierCents: 0 },
];

// Drink size choices shared by fountain drinks and combos.
const drinkSizes = [
  { id: "size-sm", name: "Small", priceModifierCents: 0, isDefault: true },
  { id: "size-md", name: "Medium", priceModifierCents: 40 },
  { id: "size-lg", name: "Large", priceModifierCents: 80 },
];

// Combo side options.
const comboSides = [
  { id: "side-chips-cheese", name: "Chips & Cheese", priceModifierCents: 0, isDefault: true },
  { id: "side-cinnamon-twists", name: "Cinnamon Twists", priceModifierCents: 30 },
  { id: "side-chips-guac", name: "Chips & Guacamole", priceModifierCents: 120 },
];

export const seedMenu: Menu = {
  categories: [
    {
      id: "cat-combos",
      name: "Combos",
      icon: "Fastfood",
      items: [
        {
          id: "ci-combo-taco",
          name: "Combo #1",
          icon: "Fastfood",
          items: [
            {
              id: "combo-taco",
              displayName: "3 Crunchy Tacos Combo",
              basePriceCents: 749,
              sizes: drinkSizes,
              modifiers: commonModifiers,
              options: comboSides,
            },
          ],
        },
        {
          id: "ci-combo-burrito",
          name: "Combo #2",
          icon: "Fastfood",
          items: [
            {
              id: "combo-burrito",
              displayName: "Burrito Supreme Combo",
              basePriceCents: 899,
              sizes: drinkSizes,
              modifiers: commonModifiers,
              options: comboSides,
            },
          ],
        },
        {
          id: "ci-combo-nachos",
          name: "Combo #3",
          icon: "Fastfood",
          items: [
            {
              id: "combo-nachos",
              displayName: "Nachos BellGrande Combo",
              basePriceCents: 829,
              sizes: drinkSizes,
              modifiers: commonModifiers,
              options: comboSides,
            },
          ],
        },
      ],
    },
    {
      id: "cat-tacos",
      name: "Tacos",
      icon: "LunchDining",
      items: [
        {
          id: "ci-crunchy-taco",
          name: "Crunchy Taco",
          icon: "LunchDining",
          items: [
            {
              id: "taco-crunchy",
              displayName: "Crunchy Taco",
              basePriceCents: 199,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
        {
          id: "ci-soft-taco",
          name: "Soft Taco",
          icon: "LunchDining",
          items: [
            {
              id: "taco-soft",
              displayName: "Soft Taco",
              basePriceCents: 209,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
        {
          id: "ci-supreme-taco",
          name: "Supreme Taco",
          icon: "LunchDining",
          items: [
            {
              id: "taco-supreme",
              displayName: "Crunchy Taco Supreme",
              basePriceCents: 279,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
      ],
    },
    {
      id: "cat-burritos",
      name: "Burritos",
      icon: "DinnerDining",
      items: [
        {
          id: "ci-bean-burrito",
          name: "Bean Burrito",
          icon: "DinnerDining",
          items: [
            {
              id: "burrito-bean",
              displayName: "Bean Burrito",
              basePriceCents: 249,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
        {
          id: "ci-burrito-supreme",
          name: "Burrito Supreme",
          icon: "DinnerDining",
          items: [
            {
              id: "burrito-supreme",
              displayName: "Burrito Supreme",
              basePriceCents: 469,
              sizes: [],
              modifiers: commonModifiers,
              options: [
                { id: "opt-beef", name: "Seasoned Beef", priceModifierCents: 0, isDefault: true },
                { id: "opt-chicken", name: "Grilled Chicken", priceModifierCents: 30 },
                { id: "opt-steak", name: "Steak", priceModifierCents: 90 },
              ],
            },
          ],
        },
        {
          id: "ci-quesarito",
          name: "Quesarito",
          icon: "DinnerDining",
          items: [
            {
              id: "quesarito",
              displayName: "Quesarito",
              basePriceCents: 519,
              sizes: [],
              modifiers: commonModifiers,
              options: [
                { id: "opt-beef-q", name: "Seasoned Beef", priceModifierCents: 0, isDefault: true },
                { id: "opt-chicken-q", name: "Grilled Chicken", priceModifierCents: 30 },
                { id: "opt-steak-q", name: "Steak", priceModifierCents: 90 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "cat-nachos",
      name: "Nachos",
      icon: "BrunchDining",
      items: [
        {
          id: "ci-nachos",
          name: "Chips & Cheese",
          icon: "BrunchDining",
          items: [
            {
              id: "nachos",
              displayName: "Nachos & Cheese",
              basePriceCents: 229,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
        {
          id: "ci-nachos-supreme",
          name: "Nachos Supreme",
          icon: "BrunchDining",
          items: [
            {
              id: "nachos-supreme",
              displayName: "Nachos Supreme",
              basePriceCents: 429,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
        {
          id: "ci-nachos-bellgrande",
          name: "Nachos BellGrande",
          icon: "BrunchDining",
          items: [
            {
              id: "nachos-bellgrande",
              displayName: "Nachos BellGrande",
              basePriceCents: 549,
              sizes: [],
              modifiers: commonModifiers,
              options: [],
            },
          ],
        },
      ],
    },
    {
      id: "cat-drinks",
      name: "Drinks",
      icon: "LocalBar",
      items: [
        {
          id: "ci-fountain",
          name: "Fountain Drink",
          icon: "LocalBar",
          items: [
            {
              id: "drink-fountain",
              displayName: "Fountain Drink",
              basePriceCents: 219,
              sizes: drinkSizes,
              modifiers: [],
              options: [
                { id: "opt-cola", name: "Cola", priceModifierCents: 0, isDefault: true },
                { id: "opt-diet-cola", name: "Diet Cola", priceModifierCents: 0 },
                { id: "opt-lemon-lime", name: "Lemon-Lime", priceModifierCents: 0 },
                { id: "opt-orange", name: "Orange", priceModifierCents: 0 },
              ],
            },
          ],
        },
        {
          id: "ci-horchata",
          name: "Horchata",
          icon: "LocalCafe",
          items: [
            {
              id: "drink-horchata",
              displayName: "Horchata",
              basePriceCents: 299,
              sizes: drinkSizes,
              modifiers: [],
              options: [],
            },
          ],
        },
        {
          id: "ci-water",
          name: "Bottled Water",
          icon: "LocalDrink",
          items: [
            {
              id: "drink-water",
              displayName: "Bottled Water",
              basePriceCents: 199,
              sizes: [],
              modifiers: [],
              options: [],
            },
          ],
        },
      ],
    },
    {
      id: "cat-desserts",
      name: "Desserts",
      icon: "Icecream",
      items: [
        {
          id: "ci-cinnamon-twists",
          name: "Cinnamon Twists",
          icon: "BakeryDining",
          items: [
            {
              id: "dessert-twists",
              displayName: "Cinnamon Twists",
              basePriceCents: 149,
              sizes: [],
              modifiers: [],
              options: [],
            },
          ],
        },
        {
          id: "ci-churros",
          name: "Churros",
          icon: "BakeryDining",
          items: [
            {
              id: "dessert-churros",
              displayName: "Churros (4 pc)",
              basePriceCents: 219,
              sizes: [],
              modifiers: [],
              options: [
                { id: "opt-caramel", name: "Caramel Dip", priceModifierCents: 50, isDefault: true },
                { id: "opt-chocolate", name: "Chocolate Dip", priceModifierCents: 50 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

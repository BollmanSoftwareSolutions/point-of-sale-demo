// Domain types for the menu tree (Panes 1 → 2 → 3).
// See design-docs/02-data-models.md §1.

// Pane 1
export interface MenuCategory {
  id: string;
  name: string; // Button text, e.g. "Combos"
  icon: string; // MUI icon id, e.g. "Fastfood"
  items: CategoryItem[];
}

// Pane 2
export interface CategoryItem {
  id: string;
  name: string; // Button text, e.g. "Combo #2"
  icon: string; // MUI icon id
  items: MenuItem[]; // Configurable items shown in Pane 3
}

// Pane 3 — a configurable product
export interface MenuItem {
  id: string;
  displayName: string; // Full name
  basePriceCents: number; // Price before modifications
  sizes: MenuChoice[]; // Empty => single size
  modifiers: MenuModifier[]; // Ingredient add/remove, e.g. "No Cheese"
  options: MenuOption[]; // Sub-selections, e.g. side / drink type
}

export interface MenuChoice {
  id: string;
  name: string; // e.g. "Large"
  priceModifierCents: number; // +/- from base; 0 for default selection
  isDefault?: boolean;
}

export interface MenuModifier {
  id: string;
  name: string; // e.g. "Add Pickles", "No Cheese"
  priceModifierCents: number; // e.g. +10 or -50
  defaultSelected?: boolean; // Standard ingredient included by default
}

export interface MenuOption {
  id: string;
  name: string; // e.g. "Fries", "Onion Rings"
  priceModifierCents: number;
  isDefault?: boolean;
}

export interface Menu {
  categories: MenuCategory[];
}

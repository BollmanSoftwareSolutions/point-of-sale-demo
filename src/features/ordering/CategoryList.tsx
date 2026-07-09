// Pane 1 — category list.
// See design-docs/03-ui-components.md §2.

import { Stack } from "@mui/material";
import { MenuButton } from "../../components/MenuButton";
import type { MenuCategory } from "../../types";

interface CategoryListProps {
  categories: MenuCategory[];
  selectedId?: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <Stack spacing={1.5}>
      {categories.map((category) => (
        <MenuButton
          key={category.id}
          label={category.name}
          icon={category.icon}
          selected={category.id === selectedId}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </Stack>
  );
}

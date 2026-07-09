// Pane 2 — category item list.
// See design-docs/03-ui-components.md §2.

import { Stack, Typography } from "@mui/material";
import { MenuButton } from "../../components/MenuButton";
import type { CategoryItem } from "../../types";

interface CategoryItemListProps {
  items: CategoryItem[];
  selectedId?: string | null;
  onSelect: (categoryItemId: string) => void;
}

export function CategoryItemList({ items, selectedId, onSelect }: CategoryItemListProps) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        Select a category to see its items.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <MenuButton
          key={item.id}
          label={item.name}
          icon={item.icon}
          selected={item.id === selectedId}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </Stack>
  );
}

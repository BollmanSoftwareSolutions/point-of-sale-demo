// Icon + text vertical button used in Panes 1 & 2.
// See design-docs/03-ui-components.md (Shared Components).

import { Button, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import Fastfood from "@mui/icons-material/Fastfood";
import LunchDining from "@mui/icons-material/LunchDining";
import DinnerDining from "@mui/icons-material/DinnerDining";
import BrunchDining from "@mui/icons-material/BrunchDining";
import BakeryDining from "@mui/icons-material/BakeryDining";
import LocalBar from "@mui/icons-material/LocalBar";
import LocalCafe from "@mui/icons-material/LocalCafe";
import LocalDrink from "@mui/icons-material/LocalDrink";
import Icecream from "@mui/icons-material/Icecream";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";

// Maps the seed data's MUI icon ids to their components.
const ICONS: Record<string, SvgIconComponent> = {
  Fastfood,
  LunchDining,
  DinnerDining,
  BrunchDining,
  BakeryDining,
  LocalBar,
  LocalCafe,
  LocalDrink,
  Icecream,
};

export interface MenuButtonProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function MenuButton({ label, icon, selected = false, onClick, disabled }: MenuButtonProps) {
  const Icon = (icon && ICONS[icon]) || RestaurantMenu;
  return (
    <Button
      fullWidth
      variant={selected ? "contained" : "outlined"}
      color="primary"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      sx={{
        minHeight: 64,
        flexDirection: "column",
        gap: 0.5,
        py: 1,
        textTransform: "none",
        lineHeight: 1.2,
      }}
    >
      <Icon fontSize="medium" />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Button>
  );
}

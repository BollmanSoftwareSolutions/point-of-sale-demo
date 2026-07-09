// Persistent footer navigation (Ordering / History / Kitchen).
// See design-docs/03-ui-components.md (Shared Components).

import { NavLink } from "react-router";

const links = [
  { to: "/order", label: "Ordering" },
  { to: "/history", label: "Order History" },
  { to: "/kitchen", label: "Kitchen" },
];

export function FooterNav() {
  // TODO: replace with MUI BottomNavigation.
  return (
    <nav style={{ display: "flex", gap: 16, padding: 12, borderTop: "1px solid #ccc" }}>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

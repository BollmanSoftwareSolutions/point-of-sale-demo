# Design Documentation

Design & architecture for the **Point of Sale demo** — a client-only React SPA
simulating a fast-food POS terminal. All requirements originate from
[features.md](features.md).

## Documents

| # | Document | Contents |
| --- | --- | --- |
| — | [features.md](features.md) | Product requirements (source of truth). |
| 1 | [01-architecture.md](01-architecture.md) | Stack, layers, key decisions, deployment. |
| 2 | [02-data-models.md](02-data-models.md) | Domain TypeScript types & seed data. |
| 3 | [03-ui-components.md](03-ui-components.md) | Screen layouts & component tree. |
| 4 | [04-api-contract.md](04-api-contract.md) | Mock (MSW) endpoint contract. |
| 5 | [05-state-and-routing.md](05-state-and-routing.md) | Zustand + TanStack Query + routing. |
| 6 | [06-project-structure.md](06-project-structure.md) | Folder layout & conventions. |

## Design Decisions (at a glance)

- **Stack:** React 19 + TypeScript + Vite + MUI v9 + Emotion.
- **UI library:** MUI (Material UI) v9 is the exclusive component kit — `@mui/material`, `@mui/x-data-grid` (History grid), `@mui/icons-material`; styling via theme/`sx`/`styled` only.
- **Theme:** primary color `#2eab4e` (green) defined in `src/theme.ts`.
- **Client state:** Zustand (auth session, cart/order build).
- **Server state:** TanStack Query v5 (menu, orders, kitchen board).
- **Routing:** react-router v8 with an auth-guarded shell.
- **Mock backend:** MSW intercepting `/api/*` over in-memory seed data.
- **Persistence:** none — deterministic re-seed on every reload.
- **Money:** integer cents in logic, formatted only at render.

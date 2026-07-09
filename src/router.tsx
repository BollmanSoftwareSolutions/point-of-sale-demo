// Route tree + RequireAuth wiring.
// See design-docs/05-state-and-routing.md §4.

import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { RootLayout } from "./components/RootLayout";
import { RequireAuth } from "./components/RequireAuth";
import { LoginScreen } from "./features/login/LoginScreen";
import { OrderingScreen } from "./features/ordering/OrderingScreen";
import { OrderHistoryScreen } from "./features/history/OrderHistoryScreen";
import { KitchenScreen } from "./features/kitchen/KitchenScreen";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", element: <LoginScreen /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/order" replace /> },
              { path: "order", element: <OrderingScreen /> },
              { path: "history", element: <OrderHistoryScreen /> },
              { path: "kitchen", element: <KitchenScreen /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);

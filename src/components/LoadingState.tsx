// Loading placeholder (MUI skeleton) for queries.
// See design-docs/03-ui-components.md (Shared Components).

import { Box, Skeleton } from "@mui/material";

interface LoadingStateProps {
  rows?: number;
}

export function LoadingState({ rows = 3 }: LoadingStateProps) {
  return (
    <Box sx={{ p: 2 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}

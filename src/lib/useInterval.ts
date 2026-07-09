// useInterval helper (10s card scroll / polling).
// See design-docs/03-ui-components.md (Kitchen) and 05-state-and-routing.md.
//
// Declarative setInterval: passing `delayMs = null` pauses the interval.

import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delayMs: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

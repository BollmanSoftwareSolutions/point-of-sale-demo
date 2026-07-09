// Vitest setup: registers jest-dom matchers for the DOM assertions used in tests.
import "@testing-library/jest-dom/vitest";

// jsdom has no ResizeObserver; provide a no-op stub for components that observe
// element size (e.g. the History grid sizing rows to fill the viewport).
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

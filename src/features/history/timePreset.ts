// Time-range presets for the Order History quick filters.
// See design-docs/03-ui-components.md §3.

export type TimePreset = "last4h" | "today" | "last7d";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Resolves a quick-filter preset to a { from, to } date range for the orders
// query. Rolling windows use ISO timestamps; "Today" uses the calendar day.
export function timePresetRange(preset: TimePreset): { from: string; to: string } {
  const now = new Date();
  switch (preset) {
    case "last4h":
      return { from: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), to: "" };
    case "today":
      return { from: localDate(now), to: localDate(now) };
    case "last7d":
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), to: "" };
  }
}

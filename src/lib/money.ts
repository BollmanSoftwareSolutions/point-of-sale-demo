// Money helpers. All amounts are integer cents.
// See design-docs/02-data-models.md (Money) and design-docs/06-project-structure.md.

// Format integer cents as "$0.00" (negatives render as "-$0.50").
export function formatMoney(cents: number): string {
  const rounded = Math.round(cents);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const dollars = Math.floor(abs / 100).toLocaleString("en-US");
  const remainder = (abs % 100).toString().padStart(2, "0");
  return `${negative ? "-" : ""}$${dollars}.${remainder}`;
}

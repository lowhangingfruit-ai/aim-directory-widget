import { CATEGORY_OPTIONS, CategoryID, PRODUCT_OPTIONS, ProductID } from "./intake";

// Category answers per MMM vendor ID, from the intake form's Sheet. Until that
// is connected the map is empty and the directory shows no category filter.
export type CategoryMap = Record<number, { categories: CategoryID[]; products: ProductID[] }>;

export const CATEGORY_LABELS: Record<CategoryID, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.id, c.label])
) as Record<CategoryID, string>;

export const PRODUCT_LABELS: Record<ProductID, string> = Object.fromEntries(
  PRODUCT_OPTIONS.map((p) => [p.id, p.label])
) as Record<ProductID, string>;

export function productsFor(category: CategoryID): { id: ProductID; label: string }[] {
  return PRODUCT_OPTIONS.filter((p) => p.category === category).map((p) => ({ id: p.id, label: p.label }));
}

// Directory colors per category, picked to suggest the category (farms green,
// fishers blue, dairy butter yellow) and drawn from the tints of AIM's market
// logos (lib/markets.ts), softened: no bright pinks or neons. `background` is
// the light tint for pills and name tiles; `art` is the darker shade for the
// selected pill, map dots, and text. Every art color reads at 4.5:1 or better
// on its tint, on the page's cream, and under white text.
const CATEGORY_COLORS: Record<CategoryID, { background: string; art: string }> = {
  certified: { background: "#dcfad9", art: "#0b6b3a" }, // green, Grand Lake's tint
  livestock: { background: "#fbe1d6", art: "#9e3412" }, // rust
  dairy: { background: "#fff3bf", art: "#735600" }, // butter yellow
  seafood: { background: "#d6e2f5", art: "#1d4f91" }, // blue, near Point Reyes' tint
  tff: { background: "#ffd9b0", art: "#8f3d00" }, // warm orange, Newark's tint
  prepacked: { background: "#f2e6cf", art: "#6f4a1c" }, // wheat
  artisan: { background: "#f7dde5", art: "#96204a" }, // muted rose
  nonprofit: { background: "#cdecf1", art: "#0b5f6b" }, // teal, San Rafael Summer's tint
  entertainer: { background: "#ece0f7", art: "#5e2f8a" }, // violet
  commercial: { background: "#e8e6d8", art: "#4f4e46" }, // neutral
};

export function categoryColors(id: CategoryID): { background: string; art: string } {
  return CATEGORY_COLORS[id] ?? { background: "#e8e6d8", art: "#55544b" };
}

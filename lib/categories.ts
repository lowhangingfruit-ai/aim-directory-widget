import { CATEGORY_OPTIONS, CategoryID, PRODUCT_OPTIONS, ProductID } from "./intake";
import { MARKET_BY_ID } from "./markets";

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

// Directory colors per category: each borrows one market logo's background and
// signature color (see lib/markets.ts). The two catch-all categories stay neutral.
const CATEGORY_MARKET: Partial<Record<CategoryID, number>> = {
  certified: 7785, // Grand Lake
  livestock: 7782, // Clement St
  dairy: 7783, // Stonestown
  seafood: 8211, // San Rafael Summer
  tff: 7781, // Newark
  prepacked: 7776, // Sunday Marin
  artisan: 7803, // Point Reyes
  entertainer: 7784, // Hayward
};

export function categoryColors(id: CategoryID): { background: string; art: string } {
  const market = CATEGORY_MARKET[id];
  const m = market ? MARKET_BY_ID[market] : undefined;
  return m ? { background: m.background, art: m.art } : { background: "#e8e6d8", art: "#55544b" };
}

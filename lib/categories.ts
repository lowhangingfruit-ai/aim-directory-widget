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

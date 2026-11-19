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

// Directory colors per category, taken from AIM's sub-brand palette in its
// Seasonal Produce Calendar and picked to suggest the category (farms green,
// ranchers red, dairy butter yellow, fishers blue). `background` is one of the
// calendar's page tints (or a light tint of one of its illustration colors)
// for pills and name tiles; `art` is the calendar's illustration color,
// darkened only as far as contrast needs, for the selected pill (white text),
// map dots, and text. Every art color reads at 4.8:1 or better on its tint, on
// the page's cream, and under white text (WCAG AA is 4.5:1). No bright magenta.
const CATEGORY_COLORS: Record<CategoryID, { background: string; art: string }> = {
  certified: { background: "#D5EED7", art: "#346F36" }, // calendar mint / leaf green #3F8641
  livestock: { background: "#FCCFBE", art: "#A72C33" }, // calendar peach / red #BC3139
  dairy: { background: "#FEE7BB", art: "#776325" }, // calendar butter / mustard #D1AE41
  seafood: { background: "#C6E0FF", art: "#2F5D8C" }, // calendar sky / dark blue
  tff: { background: "#FFDDB8", art: "#984C1C" }, // apricot / orange #ED772B
  prepacked: { background: "#F2DFC8", art: "#80582C" }, // wheat / toasted mustard
  artisan: { background: "#F1DDE6", art: "#854D6D" }, // beet tint / beet #854D6D
  nonprofit: { background: "#D6EBED", art: "#476868" }, // calendar aqua / teal #73A8A7
  entertainer: { background: "#E1D7EE", art: "#645096" }, // calendar lavender / deep lavender
  commercial: { background: "#E2E5EB", art: "#5B626F" }, // slate tint / slate #6F7787
};

export function categoryColors(id: CategoryID): { background: string; art: string } {
  return CATEGORY_COLORS[id] ?? { background: "#E2E5EB", art: "#5B626F" };
}

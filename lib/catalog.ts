import RAW from "./mmmCatalog.json";
import type { CategoryID } from "./intake";
import type { CategoryMap } from "./categories";

// What each vendor sells, from AIM's Manage My Market reports (built by
// scripts/build-mmm-catalog.py): their AIM category, organic certification,
// and each approved product with the months it's available. Server-side only;
// the page passes along just the vendors it shows.

export interface CatalogProduct {
  name: string;
  category: string; // MMM product category, e.g. "Fruit"
  organic: boolean;
  months: number[]; // 0 = January
}

export interface CatalogEntry {
  organic: boolean; // Certified Organic
  naturallyGrown: boolean; // Certified Naturally Grown
  products: CatalogProduct[];
}

export type Catalog = Record<number, CatalogEntry>;

type RawEntry = {
  categories: CategoryID[];
  organic: boolean;
  naturallyGrown: boolean;
  products: [string, string, boolean, number[]][];
};

const DATA = RAW as unknown as Record<string, RawEntry>;

export function catalogFor(vendorIDs: number[]): { catalog: Catalog; categories: CategoryMap } {
  const catalog: Catalog = {};
  const categories: CategoryMap = {};
  for (const id of vendorIDs) {
    const e = DATA[id];
    if (!e) continue;
    catalog[id] = {
      organic: e.organic,
      naturallyGrown: e.naturallyGrown,
      products: e.products.map(([name, category, organic, months]) => ({ name, category, organic, months })),
    };
    if (e.categories.length) categories[id] = { categories: e.categories, products: [] };
  }
  return { catalog, categories };
}

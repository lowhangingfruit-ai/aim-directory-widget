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

// AIM's "Temporary Food Facility" type covers both hot food stands and
// bakers, coffee roasters and jam makers. Shoppers see these as two
// categories: a TFF vendor whose approved products are mostly ready-to-eat
// concession food is a Hot Food Purveyor; one whose products are mostly
// bakery items or packaged food and drink joins "Food, Beverage, and Bakers
// or Prepackaged Foods" (the Prepacked category). Ties stay hot food.
const READY_TO_EAT = "Ready to Eat Food & Beverages (Concession)";
const PACKAGED = new Set(["Bakery Items", "Processed Food & Beverage", "Grains/Cereals/Seeds", "Dairy", "Nuts"]);

export function shopperCategories(categories: CategoryID[], products: RawEntry["products"]): CategoryID[] {
  if (!categories.includes("tff")) return categories;
  const hot = products.filter(([, c]) => c === READY_TO_EAT).length;
  const packaged = products.filter(([, c]) => PACKAGED.has(c)).length;
  if (packaged <= hot) return categories;
  return [...new Set(categories.map((c) => (c === "tff" ? "prepacked" : c)))] as CategoryID[];
}

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
    if (e.categories.length) categories[id] = { categories: shopperCategories(e.categories, e.products), products: [] };
  }
  return { catalog, categories };
}

import { CATEGORY_OPTIONS, PAYMENT_OPTIONS, PRODUCT_OPTIONS } from "./intake";
import type { CategoryID, PaymentID, ProductID } from "./intake";
import type { PaymentMap } from "./payments";
import type { CategoryMap } from "./categories";

// Turns rows from the intake Sheet into what the directory shows. Plain
// functions only, so it can be tested without Next.js.

export interface IntakeAnswers {
  payments: PaymentMap;
  categories: CategoryMap;
  origins: Record<number, string>; // where the vendor grows or makes products
  otherPayments: Record<number, string>;
}

export const EMPTY_ANSWERS: IntakeAnswers = { payments: {}, categories: {}, origins: {}, otherPayments: {} };

// Values are matched by their Sheet text, so hand edits by staff still work
// as long as the wording matches an option (case and spacing don't matter).
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

function lookup<T extends string>(cell: string | undefined, options: Record<string, T>): T[] {
  if (!cell) return [];
  const found = cell.split(",").map((part) => options[norm(part)]).filter((v): v is T => !!v);
  return [...new Set(found)];
}

const PAYMENT_BY_TEXT = Object.fromEntries(PAYMENT_OPTIONS.map((p) => [norm(p.label), p.id])) as Record<string, PaymentID>;
const CATEGORY_BY_TEXT = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [norm(c.aimName), c.id])) as Record<string, CategoryID>;
const PRODUCT_BY_TEXT = Object.fromEntries(PRODUCT_OPTIONS.map((p) => [norm(p.label), p.id])) as Record<string, ProductID>;

export function buildAnswers(rows: Record<string, string>[]): IntakeAnswers {
  // Newest row per vendor wins, including a newer row that withdraws agreement.
  const latest = new Map<number, Record<string, string>>();
  for (const row of rows) {
    const vendorID = Number(row["MMM vendor ID"]);
    if (!Number.isInteger(vendorID) || vendorID <= 0) continue;
    const prev = latest.get(vendorID);
    if (!prev || (row["Submitted at"] ?? "") >= (prev["Submitted at"] ?? "")) latest.set(vendorID, row);
  }

  const out: IntakeAnswers = { payments: {}, categories: {}, origins: {}, otherPayments: {} };
  for (const [vendorID, row] of latest) {
    if (norm(row["Agreed to show in directory"] ?? "") !== "yes") continue;

    const payments = lookup(row["Payment types"], PAYMENT_BY_TEXT);
    if (payments.length) out.payments[vendorID] = payments;

    const categories = lookup(row["AIM categories"], CATEGORY_BY_TEXT);
    const products = lookup(row["Mainly sells"], PRODUCT_BY_TEXT)
      .filter((p) => categories.includes(PRODUCT_OPTIONS.find((o) => o.id === p)!.category));
    if (categories.length) out.categories[vendorID] = { categories, products };

    const other = (row["Other payment"] ?? "").trim();
    if (other) out.otherPayments[vendorID] = other.slice(0, 120);

    const origin = (row["Grows or makes in"] ?? "").trim();
    if (origin) out.origins[vendorID] = origin.slice(0, 80);
  }
  return out;
}

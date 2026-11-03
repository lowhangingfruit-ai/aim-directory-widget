"use client";

import type { CategoryID, PaymentID, ProductID } from "@/lib/intake";
import { CATEGORY_OPTIONS } from "@/lib/intake";
import { CATEGORY_LABELS, categoryColors, productsFor } from "@/lib/categories";
import { BENEFIT_IDS, PAYMENT_SHORT } from "@/lib/payments";
import { readable, textOn } from "@/lib/markets";

export interface Filters {
  q: string;
  category: CategoryID | null;
  products: Set<ProductID>;
  payments: Set<PaymentID>;
  view: "list" | "map";
}

export const EMPTY_FILTERS: Filters = { q: "", category: null, products: new Set(), payments: new Set(), view: "list" };

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  placeholder: string;
  categoriesShown: CategoryID[]; // only categories some vendor has answered
  showPayments: boolean;
}

const pillStyle = (background: string, art: string) => ({
  "--ct": background,
  "--ca": art,
  "--ci": readable(art, background, 4.5),
  "--con": textOn(art),
}) as React.CSSProperties;

const NEUTRAL = pillStyle("#e8e6d8", "#111111");

export default function Toolbar({ filters, onChange, placeholder, categoriesShown, showPayments }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const toggle = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n; };
  const products = filters.category ? productsFor(filters.category) : [];
  const ordered = CATEGORY_OPTIONS.map((c) => c.id).filter((id) => categoriesShown.includes(id));

  return (
    <div className="tools">
      <div className="wrap">
        <div className="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          {filters.q && <button type="button" className="clear" onClick={() => set({ q: "" })} aria-label="Clear search">&times;</button>}
        </div>
        <div className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={filters.view === "list"} onClick={() => set({ view: "list" })}>List</button>
          <button type="button" aria-pressed={filters.view === "map"} onClick={() => set({ view: "map" })}>Map</button>
        </div>

        {(ordered.length > 0 || showPayments) && (
          <div className="pills">
            {ordered.length > 0 && (
              <>
                <button type="button" style={NEUTRAL} aria-pressed={!filters.category}
                  onClick={() => set({ category: null, products: new Set() })}>
                  Food or product
                </button>
                {ordered.map((id) => {
                  const c = categoryColors(id);
                  return (
                    <button key={id} type="button" style={pillStyle(c.background, c.art)} aria-pressed={filters.category === id}
                      onClick={() => set({ category: filters.category === id ? null : id, products: new Set() })}>
                      {CATEGORY_LABELS[id]}
                    </button>
                  );
                })}
              </>
            )}
            {products.map((p) => {
              const c = categoryColors(filters.category!);
              return (
                <button key={p.id} type="button" style={pillStyle("#ffffff", c.art)} aria-pressed={filters.products.has(p.id)}
                  onClick={() => set({ products: toggle(filters.products, p.id) })}>
                  {p.label}
                </button>
              );
            })}
            {showPayments && (
              <>
                <span className="label">Accepts</span>
                {[...BENEFIT_IDS, "card" as PaymentID].map((id) => (
                  <button key={id} type="button" style={pillStyle("#efe9f6", "#533180")} aria-pressed={filters.payments.has(id)}
                    onClick={() => set({ payments: toggle(filters.payments, id) })}>
                    {PAYMENT_SHORT[id]}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

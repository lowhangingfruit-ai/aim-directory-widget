"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Vendor, VendorMarket } from "@/lib/types";
import type { CategoryID, PaymentID, ProductID } from "@/lib/intake";
import { CATEGORY_OPTIONS } from "@/lib/intake";
import { CATEGORY_LABELS, CategoryMap, PRODUCT_LABELS, productsFor } from "@/lib/categories";
import { BENEFIT_IDS, PAYMENT_LABELS, PAYMENT_SHORT, PaymentMap } from "@/lib/payments";

const VendorMap = dynamic(() => import("./VendorMap"), { ssr: false });

interface Props {
  vendors: Vendor[];
  marketID?: number;
  marketName?: string;
  allMarkets: Record<number, string>;
  payments: PaymentMap;
  categories: CategoryMap;
  origins: Record<number, string>;
  coords: Record<number, [number, number]>;
  embedded?: boolean;
  otherPayments: Record<number, string>;
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function parseDate(s: string): Date {
  const [m, d, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function nextDate(markets: VendorMarket[], filterMarketID?: number | null): string | null {
  const relevant = filterMarketID
    ? markets.filter((m) => m.marketID === filterMarketID)
    : markets;
  const upcoming = relevant
    .flatMap((m) => m.dates)
    .map(parseDate)
    .filter((d) => d >= TODAY)
    .sort((a, b) => a.getTime() - b.getTime());
  if (!upcoming.length) return null;
  return upcoming[0].toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Returns ms timestamp of next upcoming date, or Infinity if none
function nextDateTimestamp(vendor: Vendor, marketID: number | null): number {
  const relevant = marketID
    ? vendor.markets.filter((m) => m.marketID === marketID)
    : vendor.markets;
  const upcoming = relevant
    .flatMap((m) => m.dates)
    .map(parseDate)
    .filter((d) => d >= TODAY)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming.length ? upcoming[0].getTime() : Infinity;
}

function groupByMonth(dates: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const d of dates) {
    const dt = parseDate(d);
    if (dt < TODAY) continue;
    const key = dt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return groups;
}

function formatPhone(raw: string): string | null {
  const s = raw.trim();
  if (!s || s === "N/A" || s === " ") return null;
  const digits = s.replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length !== 10) return null;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

function titleCase(s: string): string {
  if (!s) return s;
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const LEGAL_SUFFIXES = /[\s,]+(LLC|Inc\.?|Corp\.?|Co\.?|Ltd\.?|L\.L\.C\.?)$/i;
function displayName(company: string): string {
  return company.replace(LEGAL_SUFFIXES, "").trim();
}

const norm = (s: string) => s.trim().toLowerCase();

function formatCity(city: string, state: string): string {
  const c = titleCase(city.trim());
  const st = state.trim();
  const validState = st && st !== "0" && /^[A-Z]{2}$/.test(st);
  if (!c) return "";
  return validState ? `${c}, ${st}` : c;
}

const MARKET_SHORT: Record<number, string> = {
  7776: "Sunday Marin",
  7781: "Newark",
  7782: "Clement St.",
  7783: "Stonestown",
  7784: "Hayward",
  7785: "Grand Lake",
  7786: "Thursday Marin",
  7803: "Point Reyes",
  8211: "San Rafael Summer",
};

const MARKET_COLORS: Record<number, string> = {
  7776: "#E0368A", // Sunday Marin — magenta radish
  7781: "#4A3C96", // Newark — purple eggplant
  7782: "#C83828", // Clement St. — red tomato
  7783: "#E8956A", // Stonestown — peach apple
  7784: "#5A8C38", // Hayward — avocado green
  7785: "#C8A820", // Grand Lake — golden turnip
  7786: "#E0368A", // Thursday Marin — same radish
  7803: "#C83860", // Point Reyes — strawberry red
  8211: "#4A9CB8", // San Rafael — sky blue corn
};

const BASE = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";
const MARKET_LOGOS: Record<number, string> = {
  7776: `${BASE}/10074cb7-fd6e-4c7c-8629-4fb8a71fa9ea/marin.logo_on_yellow.jpg`,
  7781: `${BASE}/1607976531072-1VE3CAJJSAIRAFFE65Z7/newark.logo_on_peach.jpg`,
  7782: `${BASE}/4b2c106f-4eda-4004-b832-a213b950eccd/clement.logo_on_yellow.jpg`,
  7783: `${BASE}/1607976598459-TZZWCTC8QDCHJ7AS6L7T/stonestown.logo_on_green.jpg`,
  7784: `${BASE}/9f0695f7-5bbf-497a-afec-e04e45870cda/hayward.logo_on_pink.jpg`,
  7785: `${BASE}/1607976402789-E45K4WYYS5OCMOE24XG4/grandlake.logo_on_green.jpg`,
  7786: `${BASE}/10074cb7-fd6e-4c7c-8629-4fb8a71fa9ea/marin.logo_on_yellow.jpg`,
  7803: `${BASE}/040d3d2e-68cb-4196-be5e-b06e6090b108/pointreyes.logo_on_blue.jpg`,
  8211: `${BASE}/1607976583988-S19RDA6H1M7KI7F2WBGB/sanrafael.logo_on_blue.jpg`,
};


function upcomingDatesForMarket(vendors: Vendor[], marketID: number): Date[] {
  const seen = new Set<string>();
  const dates: Date[] = [];
  for (const v of vendors) {
    for (const m of v.markets) {
      if (m.marketID !== marketID) continue;
      for (const d of m.dates ?? []) {
        const dt = parseDate(d);
        if (dt >= TODAY && !seen.has(d)) {
          seen.add(d);
          dates.push(dt);
        }
      }
    }
  }
  return dates.sort((a, b) => a.getTime() - b.getTime()).slice(0, 8);
}

function fmtDateChip(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function dateKey(d: Date): string {
  return d.toLocaleDateString("en-US");
}

function useLayout() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const narrow = width < 640;
  return { cols: narrow ? 1 : width < 1000 ? 2 : 3, px: narrow ? 16 : 24, narrow, logoSize: narrow ? 64 : 96 };
}

// ── Pill ──────────────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={{
      flexShrink: 0,
      padding: "5px 14px",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      cursor: "pointer",
      border: `1.5px solid ${active ? "#0d8240" : "#d8d8d8"}`,
      borderRadius: 300,
      backgroundColor: active ? "#0d8240" : "#fff",
      color: active ? "#fff" : "#333",
      fontWeight: active ? 600 : 400,
      transition: "all 0.12s ease",
      whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

// Horizontal scroll row with a fade on the right edge, defined outside the
// component so it keeps its scroll position across renders.
const scrollRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  overflowX: "auto",
  paddingBottom: 10,
  marginBottom: 10,
  borderBottom: "1px solid #e8e8e0",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
};

function FadeRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={scrollRowStyle}>{children}</div>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 10,
        width: 48, pointerEvents: "none",
        background: "linear-gradient(to right, rgba(246,245,234,0), #f6f5ea)",
      }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DirectoryClient({ vendors, marketID, allMarkets, payments, categories, origins, coords, otherPayments, embedded = false }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(marketID ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<Set<PaymentID>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<CategoryID | null>(null);
  const [productFilter, setProductFilter] = useState<Set<ProductID>>(new Set());
  const [openID, setOpenID] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [hoveredMarket, setHoveredMarket] = useState<number | null>(null);
  const { cols, px, narrow, logoSize } = useLayout();

  const hasPayments = Object.keys(payments).length > 0;
  const hasCategories = Object.keys(categories).length > 0;
  const categoryProducts = categoryFilter ? productsFor(categoryFilter) : [];
  const openVendor = openID === null ? null : vendors.find((v) => v.vendorID === openID) ?? null;

  useEffect(() => {
    const el = document.getElementById("aim-directory-root");
    const onScroll = () => setShowBackToTop((el?.scrollTop ?? window.scrollY) > 400);
    const target = el ?? window;
    target.addEventListener("scroll", onScroll);
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  // Inside the Squarespace iframe the page itself never scrolls; the parent
  // page does. The parent snippet sends which slice of the iframe is on
  // screen, so the side panel can open there.
  const frame = useEmbedFrame(embedded);

  // Fetch the map code in the background so the Map view opens quickly.
  useEffect(() => {
    const load = () => { void import("./VendorMap"); };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = globalThis.setTimeout(load, 2000);
    return () => globalThis.clearTimeout(t);
  }, []);

  // While the side panel is open the page behind it doesn't scroll, and Esc closes it.
  useEffect(() => {
    if (openID === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenID(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openID]);

  const marketOptions = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of vendors) {
      for (const m of v.markets) {
        if (allMarkets[m.marketID]) counts[m.marketID] = (counts[m.marketID] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), name: allMarkets[Number(id)], count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors, allMarkets]);

  const dateChips = useMemo(() => {
    if (!selectedMarket) return [];
    return upcomingDatesForMarket(vendors, selectedMarket);
  }, [vendors, selectedMarket]);

  const filtered = useMemo(() => {
    let list = vendors;
    if (selectedMarket) list = list.filter((v) => v.markets.some((m) => m.marketID === selectedMarket));
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((v) =>
      v.company.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q)
    );
    if (selectedDate) {
      list = list.filter((v) =>
        v.markets.some((m) => {
          if (selectedMarket && m.marketID !== selectedMarket) return false;
          return (m.dates ?? []).some((d) => dateKey(parseDate(d)) === selectedDate);
        })
      );
    }
    if (categoryFilter) {
      list = list.filter((v) => categories[v.vendorID]?.categories.includes(categoryFilter));
    }
    // Within a category, a booth matches if it sells any of the chosen products.
    if (productFilter.size > 0) {
      list = list.filter((v) => (categories[v.vendorID]?.products ?? []).some((p) => productFilter.has(p)));
    }
    // A booth matches if it takes any of the chosen payment types.
    if (paymentFilter.size > 0) {
      list = list.filter((v) => (payments[v.vendorID] ?? []).some((p) => paymentFilter.has(p)));
    }
    // When a market is selected, sort by next upcoming date (no dates → end)
    if (selectedMarket) {
      list = [...list].sort((a, b) => {
        const ta = nextDateTimestamp(a, selectedMarket);
        const tb = nextDateTimestamp(b, selectedMarket);
        if (ta !== tb) return ta - tb;
        return a.company.localeCompare(b.company);
      });
    }

    return list;
  }, [vendors, selectedMarket, search, selectedDate, paymentFilter, payments, categoryFilter, productFilter, categories]);

  // Alphabetical, with names starting in a digit after Z. One continuous grid,
  // so rows never break where the letter changes.
  const ordered = useMemo(() => {
    if (selectedMarket) return filtered;
    const isNumeric = (v: Vendor) => /\d/.test(v.company[0] ?? "");
    return [...filtered.filter((v) => !isNumeric(v)), ...filtered.filter(isNumeric)];
  }, [filtered, selectedMarket]);

  const handleMarketSelect = (id: number) => {
    setSelectedMarket((prev) => (prev === id ? null : id));
    setSelectedDate(null);
    setSearch("");
  };

  const selectCategory = (id: CategoryID) => {
    setCategoryFilter((prev) => (prev === id ? null : id));
    setProductFilter(new Set());
  };

  const toggleProduct = (id: ProductID) => {
    setProductFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePayment = (id: PaymentID) => {
    setPaymentFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasActiveFilter = !!(selectedDate || search || paymentFilter.size > 0 || categoryFilter);

  return (
    <div id="aim-directory-root" style={{ fontFamily: "var(--font-body)", position: "relative" }}>

      {/* ── Sticky filter header ── */}
      <div style={{
        position: embedded ? "static" : "sticky", top: 0, zIndex: 20,
        backgroundColor: "#f6f5ea",
        borderTop: "1px solid #e8e7dc",
        borderBottom: "1px solid #e8e7dc",
        padding: `14px ${px}px 12px`,
      }}>
        {/* Branded market logo scroll row */}
        {!marketID && (
          <FadeRow>
            {marketOptions.map((m) => {
              const active = selectedMarket === m.id;
              const hovered = hoveredMarket === m.id;
              const color = MARKET_COLORS[m.id] ?? "#0d8240";
              return (
                <button
                  key={m.id}
                  onClick={() => handleMarketSelect(m.id)}
                  onMouseEnter={() => setHoveredMarket(m.id)}
                  onMouseLeave={() => setHoveredMarket(null)}
                  aria-pressed={active}
                  style={{
                    flexShrink: 0, border: "none", background: "none",
                    cursor: "pointer", padding: "0 4px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}
                >
                  <div style={{
                    width: logoSize, height: logoSize, overflow: "hidden",
                    opacity: selectedMarket && !active ? 0.35 : 1,
                    transition: "opacity 0.15s ease",
                  }}>
                    {MARKET_LOGOS[m.id] ? (
                      <img src={MARKET_LOGOS[m.id]} alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: color }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-body)", lineHeight: 1.3,
                    textAlign: "center", maxWidth: logoSize + 8,
                    color: active ? "#111" : hovered ? "#333" : "#666",
                    fontWeight: active ? 700 : 400,
                    borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
                    paddingBottom: 2,
                    transition: "color 0.12s ease",
                  }}>
                    {m.name}
                    <span style={{ display: "block", fontSize: 10.5, color: active ? "#333" : "#888", fontWeight: 400, marginTop: 1 }}>
                      {m.count} {m.count === 1 ? "vendor" : "vendors"}
                    </span>
                  </span>
                </button>
              );
            })}
          </FadeRow>
        )}

        {/* Mobile refine toggle */}
        {narrow && selectedMarket && dateChips.length > 0 && (
          <button onClick={() => setShowFilters(p => !p)} style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "1px solid #d8d8d8", borderRadius: 0,
            padding: "4px 12px", fontSize: 12, cursor: "pointer",
            color: selectedDate ? "#0d8240" : "#666",
            fontFamily: "var(--font-body)",
            marginBottom: 10,
          }}>
            {showFilters ? "Hide filters ↑" : `Filter by date ↓${selectedDate ? " ●" : ""}`}
          </button>
        )}

        {/* Date chips */}
        {selectedMarket && dateChips.length > 0 && (!narrow || showFilters || !!selectedDate) && (
          <FadeRow>
            {dateChips.map((d, i) => {
              const key = dateKey(d);
              const active = selectedDate === key;
              return (
                <button key={key}
                  onClick={() => setSelectedDate((p) => (p === key ? null : key))}
                  style={{
                    flexShrink: 0, background: "none", border: "none", cursor: "pointer",
                    padding: "2px 0", marginRight: 20,
                    fontFamily: "var(--font-body)", fontSize: 13,
                    color: active ? "#111" : "#666",
                    fontWeight: active ? 700 : 400,
                    borderBottom: active ? "2px solid #0d8240" : "2px solid transparent",
                    whiteSpace: "nowrap",
                  }}>
                  {i === 0 && !active && <span style={{ color: "#0d8240", marginRight: 5, fontSize: 8 }}>●</span>}
                  {fmtDateChip(d)}
                </button>
              );
            })}
          </FadeRow>
        )}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0aea9", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search market participants, products, city…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search market participants"
            style={{
              width: "100%", padding: "10px 36px",
              fontFamily: "var(--font-body)", fontSize: 14,
              border: "1px solid #d8d8d8", borderRadius: 0,
              backgroundColor: "#fff", color: "#000",
              outline: "none", boxSizing: "border-box",
            }} />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#afada9", fontSize: 16, lineHeight: 1, padding: 2,
            }}>×</button>
          )}
        </div>

        {/* Category filter, with product follow-ups for the two broad categories */}
        {hasCategories && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, overflowX: "auto", scrollbarWidth: "none" }}>
            <span style={{ fontSize: 13, color: "#555", marginRight: 4, whiteSpace: "nowrap" }}>Category</span>
            {CATEGORY_OPTIONS.map((c) => (
              <FilterPill key={c.id} label={c.label} active={categoryFilter === c.id} onClick={() => selectCategory(c.id)} />
            ))}
          </div>
        )}
        {hasCategories && categoryProducts.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, overflowX: "auto", scrollbarWidth: "none" }}>
            <span style={{ fontSize: 13, color: "#555", marginRight: 4, whiteSpace: "nowrap" }}>Sells</span>
            {categoryProducts.map((p) => (
              <FilterPill key={p.id} label={p.label} active={productFilter.has(p.id)} onClick={() => toggleProduct(p.id)} />
            ))}
          </div>
        )}

        {/* Payment filter */}
        {hasPayments && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, overflowX: "auto", scrollbarWidth: "none" }}>
            <span style={{ fontSize: 13, color: "#555", marginRight: 4, whiteSpace: "nowrap" }}>Accepts</span>
            {[...BENEFIT_IDS, "card" as PaymentID].map((id) => (
              <FilterPill key={id} label={PAYMENT_SHORT[id]} active={paymentFilter.has(id)} onClick={() => togglePayment(id)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: `0 ${px}px 48px` }}>

        {/* Count + toggle row */}
        <div style={{ padding: "16px 0 6px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <p style={{ fontSize: 13, margin: 0, color: "#555" }}>
            <span style={{ fontWeight: 600, color: "#111" }}>{filtered.length}</span>
            {" "}{filtered.length === 1 ? "market participant" : "market participants"}
            {selectedMarket && !selectedDate && ` at ${allMarkets[selectedMarket]}`}
            {selectedDate && ` attending ${selectedDate}`}
            {categoryFilter && ` in ${CATEGORY_LABELS[categoryFilter]}`}
            {productFilter.size > 0 && ` selling ${[...productFilter].map((p) => PRODUCT_LABELS[p].toLowerCase()).join(" or ")}`}
            {paymentFilter.size > 0 && ` accepting ${[...paymentFilter].map((p) => PAYMENT_SHORT[p]).join(" or ")}`}
            {search ? ` matching "${search}"` : ""}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasActiveFilter && (
              <button onClick={() => { setSelectedDate(null); setSearch(""); setPaymentFilter(new Set()); setCategoryFilter(null); setProductFilter(new Set()); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#0d8240", fontSize: 12, padding: 0, textDecoration: "underline", whiteSpace: "nowrap" }}>
                Clear filters
              </button>
            )}
            {/* List / Map toggle */}
            <div style={{ display: "flex", border: "1px solid #d8d8d8", borderRadius: 0, overflow: "hidden", flexShrink: 0 }}>
              {(["list", "map"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "5px 12px", fontSize: 12, cursor: "pointer",
                  fontFamily: "var(--font-body)", border: "none", borderRadius: 0,
                  backgroundColor: view === v ? "#0d8240" : "#fff",
                  color: view === v ? "#fff" : "#666",
                  fontWeight: view === v ? 600 : 400,
                  transition: "background 0.12s ease, color 0.12s ease",
                }}>
                  {v === "list" ? "List" : "Map"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map view */}
        {view === "map" && (
          <VendorMap
            vendors={filtered}
            origins={origins}
            coords={coords}
            selectedMarket={selectedMarket}
            allMarkets={allMarkets}
            marketColor={selectedMarket ? MARKET_COLORS[selectedMarket] : "#0d8240"}
          />
        )}

        {/* Vendor list */}
        {view === "list" && (ordered.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "64px 0" }}>No market participants found.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            columnGap: 24,
            alignItems: "stretch",
          }}>
            {ordered.map((vendor) => (
              <VendorCard
                key={vendor.vendorID}
                vendor={vendor}
                onOpen={() => setOpenID(vendor.vendorID)}
                selectedMarket={selectedMarket}
                selectedDate={selectedDate}
                payments={payments[vendor.vendorID]}
              />
            ))}
          </div>
        ))}
      </div>

      {openVendor && (
        <VendorPanel
          vendor={openVendor}
          onClose={() => setOpenID(null)}
          narrow={narrow}
          selectedMarket={selectedMarket}
          allMarkets={allMarkets}
          payments={payments[openVendor.vendorID]}
          categories={categories[openVendor.vendorID]}
          origin={origins[openVendor.vendorID]}
          embedded={embedded}
          frame={frame}
          otherPayment={otherPayments[openVendor.vendorID]}
        />
      )}

      {/* Back to top */}
      {showBackToTop && !openVendor && !embedded && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 50,
            width: 36, height: 36, borderRadius: 0,
            backgroundColor: "#0d8240", color: "#fff",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            fontSize: 16, lineHeight: 1,
          }}
          aria-label="Back to top"
        >↑</button>
      )}
    </div>
  );
}

// ── Vendor image ───────────────────────────────────────────────────────────────
// Most MMM uploads are logos in every shape, so the whole image is shown on
// white rather than cropped. No upload, or one that fails, gets an initial tile.
const TILE_COLORS = [
  { bg: "#e7f1e4", fg: "#0d8240" },
  { bg: "#fdf0dc", fg: "#b8641d" },
  { bg: "#fbe6e6", fg: "#b33a3a" },
  { bg: "#e3eef6", fg: "#2f6f95" },
  { bg: "#f1ecd6", fg: "#7d6a1e" },
];

function VendorImage({ vendor, size, eager = false }: { vendor: Vendor; size: number; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = vendor.photo?.trim();
  const name = displayName(vendor.company);

  if (src && !failed) {
    return (
      <div style={{
        width: size, height: size, flexShrink: 0, backgroundColor: "#fff",
        border: "1px solid #e8e7dc", overflow: "hidden",
      }}>
        <Image
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          sizes={`${size}px`}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>
    );
  }

  const initial = (name.match(/[A-Za-z0-9]/)?.[0] ?? "?").toUpperCase();
  const tone = TILE_COLORS[vendor.vendorID % TILE_COLORS.length];
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0, backgroundColor: tone.bg, color: tone.fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: Math.round(size * 0.42), lineHeight: 1,
    }}>
      {initial}
    </div>
  );
}

// ── Market marks ───────────────────────────────────────────────────────────────
// Sunday and Thursday Marin share one logo, so marks are grouped by logo.
function marketMarks(vendor: Vendor): { key: string; logo?: string; color: string; names: string[] }[] {
  const byKey = new Map<string, { key: string; logo?: string; color: string; names: string[] }>();
  const sorted = vendor.markets
    .filter((m) => MARKET_SHORT[m.marketID])
    .sort((a, b) => MARKET_SHORT[a.marketID].localeCompare(MARKET_SHORT[b.marketID]));
  for (const m of sorted) {
    const logo = MARKET_LOGOS[m.marketID];
    const key = logo ?? String(m.marketID);
    const entry = byKey.get(key) ?? { key, logo, color: MARKET_COLORS[m.marketID] ?? "#0d8240", names: [] };
    entry.names.push(MARKET_SHORT[m.marketID]);
    byKey.set(key, entry);
  }
  return [...byKey.values()];
}

function MarketMarks({ vendor, max = 5, size = 22 }: { vendor: Vendor; max?: number; size?: number }) {
  const marks = marketMarks(vendor);
  if (!marks.length) return null;
  const shown = marks.slice(0, max);
  const label = marks.flatMap((m) => m.names).join(", ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }} title={label} aria-label={`Sells at ${label}`}>
      {shown.map((m) => m.logo ? (
        <img key={m.key} src={m.logo} alt="" style={{ width: size, height: size, objectFit: "cover", display: "block" }} />
      ) : (
        <span key={m.key} style={{ width: size, height: size, background: m.color, display: "block" }} />
      ))}
      {marks.length > max && (
        <span style={{ fontSize: 12, color: "#666", marginLeft: 2 }}>+{marks.length - max}</span>
      )}
    </div>
  );
}

// ── Payment badges ─────────────────────────────────────────────────────────────
function PaymentBadges({ ids, only }: { ids?: PaymentID[]; only?: PaymentID[] }) {
  const list = (ids ?? []).filter((id) => !only || only.includes(id));
  if (!list.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {list.map((id) => (
        <span key={id} style={{
          fontSize: 11, fontWeight: 600, lineHeight: 1.5, letterSpacing: "0.02em",
          padding: "1px 8px", borderRadius: 300,
          border: "1px solid #0d8240", color: "#0d8240", backgroundColor: "#fff",
          whiteSpace: "nowrap",
        }}>
          {PAYMENT_SHORT[id]}
        </span>
      ))}
    </div>
  );
}

// ── Vendor card ────────────────────────────────────────────────────────────────
function VendorCard({ vendor, onOpen, selectedMarket, selectedDate, payments }: {
  vendor: Vendor;
  onOpen: () => void;
  selectedMarket: number | null;
  selectedDate: string | null;
  payments?: PaymentID[];
}) {
  const [hovered, setHovered] = useState(false);
  const next = nextDate(vendor.markets, selectedMarket);
  const location = formatCity(vendor.city, vendor.state);
  const dimmed = nextDateTimestamp(vendor, selectedMarket) === Infinity && !!selectedMarket;
  const description = vendor.description?.trim();

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        width: "100%", height: "100%", textAlign: "left",
        padding: "18px 10px",
        background: hovered ? "#faf9f2" : "transparent",
        border: "none", borderBottom: "1px solid #e8e7dc", borderRadius: 0,
        cursor: "pointer", fontFamily: "var(--font-body)", color: "#000",
        opacity: dimmed ? 0.55 : 1,
        transition: "background 0.15s ease",
      }}
    >
      <VendorImage vendor={vendor} size={64} />
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, lineHeight: 1.25,
          color: dimmed ? "#888" : "#111",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {displayName(vendor.company)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
          {location && <span style={{ color: "#666" }}>{location}</span>}
          {next && !selectedDate && location && <span style={{ color: "#c8c6ba" }}>·</span>}
          {next && !selectedDate && <span style={{ color: "#0d8240", fontWeight: 600 }}>{next}</span>}
          {!next && selectedMarket && <span style={{ color: "#999" }}>Dates TBD</span>}
        </div>
        {description && (
          <p style={{
            margin: 0, fontSize: 13.5, color: "#494949", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          <MarketMarks vendor={vendor} />
          <PaymentBadges ids={payments} only={BENEFIT_IDS} />
        </div>
      </div>
    </button>
  );
}

// ── Contact links ──────────────────────────────────────────────────────────────
const LINK_STYLE: React.CSSProperties = {
  fontSize: 14, color: "#0d8240", textDecoration: "none", fontWeight: 600,
  display: "flex", alignItems: "center", gap: 6,
};

function ContactLinks({ vendor }: { vendor: Vendor }) {
  const phone = formatPhone(vendor.phone1);
  const website = vendor.website?.trim();
  const instagram = vendor.instagram_profile?.trim();
  const facebook = vendor.facebook_profile?.trim();
  if (!phone && !website && !instagram && !facebook) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", alignItems: "center" }}>
      {phone && (
        <a href={`tel:${vendor.phone1}`} style={LINK_STYLE}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {phone}
        </a>
      )}
      {website && (
        <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Website
        </a>
      )}
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Instagram
        </a>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          Facebook
        </a>
      )}
    </div>
  );
}

// ── Embed support ──────────────────────────────────────────────────────────────
// Messages between this page and the snippet on AIM's Squarespace page.
//   out: { type: "aim-directory-height", height } so the iframe fits the content
//   in:  { type: "aim-directory-viewport", top, height } the visible slice
interface EmbedFrame { top: number; height: number }

function useEmbedFrame(embedded: boolean): EmbedFrame | null {
  const [frame, setFrame] = useState<EmbedFrame | null>(null);

  useEffect(() => {
    if (!embedded || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const d = e.data as { type?: string; top?: unknown; height?: unknown } | null;
      if (d?.type !== "aim-directory-viewport") return;
      if (typeof d.top !== "number" || typeof d.height !== "number" || !isFinite(d.top) || !isFinite(d.height)) return;
      setFrame({ top: Math.max(0, d.top), height: Math.max(320, d.height) });
    };
    window.addEventListener("message", onMessage);

    // Posted on several triggers: ResizeObserver is missing in some webviews,
    // and fonts and images change the height after first paint.
    let last = -1;
    const post = () => {
      const height = document.body.scrollHeight;
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: "aim-directory-height", height }, "*");
    };
    post();
    window.parent.postMessage({ type: "aim-directory-ready" }, "*");
    window.addEventListener("resize", post);
    window.addEventListener("load", post);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(post);
    observer?.observe(document.body);
    const timers = [100, 400, 1200, 3000].map((ms) => window.setTimeout(post, ms));
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", post);
      window.removeEventListener("load", post);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [embedded]);

  return frame;
}

// ── Side panel ─────────────────────────────────────────────────────────────────
const PANEL_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 16, color: "#000", margin: "0 0 8px",
};

function VendorPanel({ vendor, onClose, narrow, selectedMarket, allMarkets, payments, categories, origin, otherPayment, embedded, frame }: {
  vendor: Vendor;
  onClose: () => void;
  narrow: boolean;
  selectedMarket: number | null;
  allMarkets: Record<number, string>;
  payments?: PaymentID[];
  categories?: CategoryMap[number];
  origin?: string;
  otherPayment?: string;
  embedded: boolean;
  frame: EmbedFrame | null;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, [vendor.vendorID]);

  const name = displayName(vendor.company);
  const location = formatCity(vendor.city, vendor.state);
  const description = vendor.description?.trim();
  const markets = vendor.markets
    .filter((m) => allMarkets[m.marketID])
    .sort((a, b) => {
      if (selectedMarket) {
        if (a.marketID === selectedMarket) return -1;
        if (b.marketID === selectedMarket) return 1;
      }
      return nextDateTimestamp({ ...vendor, markets: [a] }, null) - nextDateTimestamp({ ...vendor, markets: [b] }, null);
    });

  const panel = (
    <div role="dialog" aria-modal="true" aria-label={name} style={embedded ? {
      // Placed over the part of the iframe the visitor can see. Without word
      // from the parent page, it opens near the top of the list.
      position: "absolute", left: 0, right: 0, zIndex: 100,
      top: frame?.top ?? 0, height: frame?.height ?? 720,
    } : { position: "fixed", inset: 0, zIndex: 100 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.32)" }} />
      <aside style={{
        position: "absolute", top: 0, right: 0, bottom: 0,
        width: narrow ? "100%" : 460, maxWidth: "100%",
        backgroundColor: "#fff", overflowY: "auto",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        fontFamily: "var(--font-body)",
      }}>
        <div style={{
          position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff",
          display: "flex", justifyContent: "flex-end", padding: "10px 12px",
        }}>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" style={{
            width: 36, height: 36, border: "1px solid #e8e7dc", borderRadius: 300,
            background: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1, color: "#333",
          }}>×</button>
        </div>

        <div style={{ padding: "0 28px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <VendorImage vendor={vendor} size={96} eager />
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 26, lineHeight: 1.2, margin: "0 0 4px" }}>
                {name}
              </h2>
              {location && <div style={{ fontSize: 14, color: "#666" }}>{location}</div>}
              {origin && norm(origin) !== norm(vendor.city ?? "") && (
                <div style={{ fontSize: 13.5, color: "#666" }}>Grown or made in {origin}</div>
              )}
              {categories && categories.categories.length > 0 && (
                <div style={{ fontSize: 13.5, color: "#0d8240", fontWeight: 600, marginTop: 4 }}>
                  {categories.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
                  {categories.products.length > 0 && (
                    <span style={{ color: "#555", fontWeight: 400 }}>
                      {" "}({categories.products.map((p) => PRODUCT_LABELS[p]).join(", ")})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {((payments && payments.length > 0) || otherPayment) && (
            <section>
              <h3 style={PANEL_LABEL}>Ways to pay</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(payments ?? []).map((id) => (
                  <span key={id} style={{
                    fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: 300,
                    backgroundColor: BENEFIT_IDS.includes(id) ? "#0d8240" : "#f6f5ea",
                    color: BENEFIT_IDS.includes(id) ? "#fff" : "#333",
                  }}>
                    {PAYMENT_LABELS[id]}
                  </span>
                ))}
              </div>
              {otherPayment && (
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#555" }}>Also accepts: {otherPayment}</p>
              )}
            </section>
          )}

          {description && (
            <p style={{ margin: 0, fontSize: 15, color: "#222", lineHeight: 1.75 }}>{description}</p>
          )}

          <ContactLinks vendor={vendor} />

          {markets.length > 0 && (
            <section>
              <h3 style={PANEL_LABEL}>Where to find them</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {markets.map((m) => {
                  const months = Object.entries(groupByMonth(m.dates ?? []));
                  return (
                    <div key={m.marketID}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        {MARKET_LOGOS[m.marketID] ? (
                          <img src={MARKET_LOGOS[m.marketID]} alt=""
                            style={{ width: 36, height: 36, objectFit: "cover", display: "block", flexShrink: 0 }} />
                        ) : (
                          <span style={{ width: 36, height: 36, background: MARKET_COLORS[m.marketID] ?? "#0d8240", display: "block" }} />
                        )}
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{allMarkets[m.marketID] ?? m.market}</span>
                      </div>
                      {months.length === 0 ? (
                        <span style={{ fontSize: 13, color: "#888" }}>Dates TBD</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {months.map(([month, days]) => (
                            <div key={month} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                              <span style={{ fontSize: 12.5, color: "#888", minWidth: 64, flexShrink: 0 }}>
                                {month.replace(/\s*\d{4}$/, "")}
                              </span>
                              <span style={{ fontSize: 13.5, color: "#333", lineHeight: 1.7 }}>{days.join(" · ")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
  return embedded ? createPortal(panel, document.body) : panel;
}

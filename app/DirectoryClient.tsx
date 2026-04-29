"use client";

import { useState, useMemo, useRef } from "react";
import { Vendor, VendorMarket } from "@/lib/types";

interface Props {
  vendors: Vendor[];
  marketID?: number;
  marketName?: string;
  allMarkets: Record<number, string>;
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
  return upcoming[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function formatCity(city: string, state: string): string {
  const c = titleCase(city.trim());
  const st = state.trim();
  const validState = st && st !== "0" && /^[A-Z]{2}$/.test(st);
  if (!c) return "";
  return validState ? `${c}, ${st}` : c;
}

const MARKET_SHORT: Record<number, string> = {
  7776: "Sun Marin",
  7781: "Newark",
  7782: "Clement St.",
  7783: "Stonestown",
  7784: "Hayward",
  7785: "Grand Lake",
  7786: "Thu Marin",
  7803: "Point Reyes",
  8211: "San Rafael",
};

// ── Autotag ──────────────────────────────────────────────────────────────────

const CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: "Produce", keywords: ["vegetable", "veggie", "produce", "greens", "lettuce", "kale", "spinach", "herb", "tomato", "pepper", "squash", "onion", "garlic", "root", "seasonal", "crop", "farm fresh", "microgreen"] },
  { label: "Fruit", keywords: ["fruit", "berry", "berries", "apple", "pear", "citrus", "strawberry", "peach", "plum", "cherry", "melon", "stone fruit", "grape", "fig", "nectarine"] },
  { label: "Bakery", keywords: ["bread", "pastry", "bake", "bakery", "sourdough", "croissant", "muffin", "cake", "cookie", "flour", "tortilla", "bagel", "loaf", "biscuit", "scone", "pita"] },
  { label: "Dairy & Eggs", keywords: ["cheese", "dairy", "yogurt", "milk", "butter", "cream", "chevre", "kefir", "egg", "creamery", "cheddar", "gouda", "brie"] },
  { label: "Meat & Poultry", keywords: ["meat", "beef", "pork", "lamb", "chicken", "poultry", "turkey", "sausage", "grass-fed", "pasture", "heritage", "ranch", "salami", "charcuterie", "duck", "rabbit"] },
  { label: "Seafood", keywords: ["fish", "seafood", "salmon", "oyster", "crab", "shrimp", "halibut", "tuna", "shellfish", "catch", "dungeness", "clam", "mussel", "anchovy", "squid"] },
  { label: "Flowers & Plants", keywords: ["flower", "floral", "bouquet", "bloom", "plant", "succulent", "arrangement", "nursery", "botanical", "garden", "orchid", "rose", "lavender"] },
  { label: "Honey & Preserves", keywords: ["honey", "jam", "jelly", "preserve", "pickle", "ferment", "condiment", "spread", "marmalade", "chutney", "hot sauce", "vinegar", "beeswax"] },
  { label: "Prepared Foods", keywords: ["prepared", "ready", "meal", "sauce", "soup", "snack", "dip", "salsa", "olive", "hummus", "pesto", "tamale", "empanada", "dumpling", "jerky", "granola", "nut butter", "chocolate"] },
  { label: "Beverages", keywords: ["coffee", "tea", "juice", "drink", "beverage", "kombucha", "cider", "brew", "roast", "chai", "smoothie", "lemonade", "shrub", "tonic"] },
  { label: "Mushrooms", keywords: ["mushroom", "fungi", "shiitake", "oyster mushroom", "chanterelle", "porcini", "mycel"] },
  { label: "Nuts & Grains", keywords: ["nut", "almond", "walnut", "pistachio", "pecan", "hazelnut", "grain", "rice", "quinoa", "oat", "seed", "legume", "bean", "lentil"] },
];

function autoTag(vendor: Vendor): string[] {
  const text = `${vendor.company} ${vendor.description ?? ""}`.toLowerCase();
  return CATEGORIES.filter((cat) =>
    cat.keywords.some((kw) => text.includes(kw))
  ).map((cat) => cat.label);
}

// ── Date helpers ──────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function DirectoryClient({ vendors, marketID, marketName, allMarkets }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(marketID ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedID, setExpandedID] = useState<number | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const marketOptions = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of vendors) {
      for (const m of v.markets) {
        if (allMarkets[m.marketID]) {
          counts[m.marketID] = (counts[m.marketID] ?? 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([id, count]) => ({ id: Number(id), name: allMarkets[Number(id)], count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [vendors, allMarkets]);

  // Date chips — computed from the full vendor list for the selected market
  const dateChips = useMemo(() => {
    if (!selectedMarket) return [];
    return upcomingDatesForMarket(vendors, selectedMarket);
  }, [vendors, selectedMarket]);

  // Vendors after market + search + date + category
  const filtered = useMemo(() => {
    let list = vendors;

    if (selectedMarket) {
      list = list.filter((v) => v.markets.some((m) => m.marketID === selectedMarket));
    }

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (v) =>
          v.company.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q)
      );
    }

    if (selectedDate) {
      list = list.filter((v) =>
        v.markets.some((m) => {
          if (selectedMarket && m.marketID !== selectedMarket) return false;
          return (m.dates ?? []).some((d) => {
            const dt = parseDate(d);
            return dateKey(dt) === selectedDate;
          });
        })
      );
    }

    if (selectedCategory) {
      list = list.filter((v) => autoTag(v).includes(selectedCategory));
    }

    return list;
  }, [vendors, selectedMarket, search, selectedDate, selectedCategory]);

  // Available categories — computed after market+search+date (before category filter)
  const availableCategories = useMemo(() => {
    let list = vendors;
    if (selectedMarket) list = list.filter((v) => v.markets.some((m) => m.marketID === selectedMarket));
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((v) => v.company.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q));
    if (selectedDate) {
      list = list.filter((v) =>
        v.markets.some((m) => {
          if (selectedMarket && m.marketID !== selectedMarket) return false;
          return (m.dates ?? []).some((d) => dateKey(parseDate(d)) === selectedDate);
        })
      );
    }
    const counts: Record<string, number> = {};
    for (const v of list) {
      for (const tag of autoTag(v)) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return CATEGORIES.filter((c) => counts[c.label]).map((c) => ({ label: c.label, count: counts[c.label] }));
  }, [vendors, selectedMarket, search, selectedDate]);

  const letters = useMemo(() => {
    const seen = new Set<string>();
    for (const v of filtered) {
      const l = v.company[0]?.toUpperCase();
      if (l) seen.add(l);
    }
    return Array.from(seen).sort();
  }, [filtered]);

  const toggle = (id: number) => setExpandedID((prev) => (prev === id ? null : id));

  const jumpTo = (letter: string) => {
    setActiveLetter(letter);
    letterRefs.current[letter]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => setActiveLetter(null), 800);
  };

  const handleMarketSelect = (id: number) => {
    setSelectedMarket((prev) => (prev === id ? null : id));
    setSelectedDate(null);
    setSelectedCategory(null);
    setExpandedID(null);
    setSearch("");
  };

  const handleDateSelect = (key: string) => {
    setSelectedDate((prev) => (prev === key ? null : key));
    setExpandedID(null);
  };

  const handleCategorySelect = (label: string) => {
    setSelectedCategory((prev) => (prev === label ? null : label));
    setExpandedID(null);
  };

  const displayTitle = selectedMarket
    ? (allMarkets[selectedMarket] ?? marketName ?? "Market Participants")
    : marketName ?? "All Market Participants";

  const hasActiveFilter = !!(selectedDate || selectedCategory || search);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "#f6f5ea",
        borderTop: "3px solid #0d8240",
        borderBottom: "1px solid #d8d8d8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: "14px 20px 12px",
      }}>

        {/* Market pills */}
        {!marketID && (
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 10,
            marginBottom: 10,
            borderBottom: "1px solid #e8e8e0",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
            scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          }}>
            {marketOptions.map((m) => {
              const active = selectedMarket === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMarketSelect(m.id)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    cursor: "pointer",
                    border: `1px solid ${active ? "#0d8240" : "#d8d8d8"}`,
                    borderRadius: 20,
                    backgroundColor: active ? "#0d8240" : "#fff",
                    color: active ? "#fff" : "#494949",
                    transition: "all 0.12s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.name}
                  <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.65 }}>{m.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Date chips — only when a market is selected */}
        {selectedMarket && dateChips.length > 0 && (
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 10,
            marginBottom: 10,
            borderBottom: "1px solid #e8e8e0",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
            scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          }}>
            <span style={{ fontSize: 11, color: "#afada9", alignSelf: "center", flexShrink: 0, marginRight: 2 }}>
              Date
            </span>
            {dateChips.map((d) => {
              const key = dateKey(d);
              const active = selectedDate === key;
              return (
                <button
                  key={key}
                  onClick={() => handleDateSelect(key)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    cursor: "pointer",
                    border: `1px solid ${active ? "#0d8240" : "#d8d8d8"}`,
                    borderRadius: 20,
                    backgroundColor: active ? "#0d8240" : "#fff",
                    color: active ? "#fff" : "#494949",
                    transition: "all 0.12s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmtDateChip(d)}
                </button>
              );
            })}
          </div>
        )}

        {/* Category chips */}
        {availableCategories.length > 0 && (
          <div style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 10,
            marginBottom: 10,
            borderBottom: "1px solid #e8e8e0",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
            scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
          }}>
            <span style={{ fontSize: 11, color: "#afada9", alignSelf: "center", flexShrink: 0, marginRight: 2 }}>
              Category
            </span>
            {availableCategories.map(({ label, count }) => {
              const active = selectedCategory === label;
              return (
                <button
                  key={label}
                  onClick={() => handleCategorySelect(label)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    cursor: "pointer",
                    border: `1px solid ${active ? "#0d8240" : "#d8d8d8"}`,
                    borderRadius: 20,
                    backgroundColor: active ? "#0d8240" : "transparent",
                    color: active ? "#fff" : "#494949",
                    transition: "all 0.12s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                  <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.65 }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#afada9", pointerEvents: "none" }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search vendors, products, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px 9px 36px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              backgroundColor: "#fff",
              color: "#000",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#afada9",
                fontSize: 16, lineHeight: 1, padding: 2,
              }}
            >×</button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ padding: "0 20px 32px" }}>

        {/* Title + count + active filter summary */}
        <div style={{ padding: "16px 0 4px" }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: 24,
            fontWeight: 500,
            color: "#000",
            marginBottom: 2,
          }}>
            {displayTitle}
          </h2>
          <p style={{ color: "#afada9", fontSize: 13, margin: 0 }}>
            {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"}
            {selectedDate && ` · ${selectedDate}`}
            {selectedCategory && ` · ${selectedCategory}`}
            {search ? ` matching "${search}"` : ""}
          </p>
          {hasActiveFilter && (
            <button
              onClick={() => { setSelectedDate(null); setSelectedCategory(null); setSearch(""); }}
              style={{
                marginTop: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#0d8240",
                fontSize: 12,
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* A–Z jump nav */}
        {filtered.length > 20 && letters.length > 1 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            margin: "12px 0 4px",
            paddingBottom: 12,
            borderBottom: "1px solid #e8e8e0",
          }}>
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => jumpTo(l)}
                style={{
                  width: 27,
                  height: 27,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 4,
                  backgroundColor: activeLetter === l ? "#0d8240" : "transparent",
                  color: activeLetter === l ? "#fff" : "#0d8240",
                  transition: "all 0.12s ease",
                  padding: 0,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Vendor list */}
        <div>
          {filtered.length === 0 && (
            <p style={{ color: "#afada9", textAlign: "center", padding: "48px 0" }}>
              No vendors found.
            </p>
          )}
          {filtered.map((vendor, i) => {
            const letter = vendor.company[0]?.toUpperCase();
            const prevLetter = i > 0 ? filtered[i - 1].company[0]?.toUpperCase() : null;
            const isNewLetter = letter !== prevLetter;
            return (
              <div key={vendor.vendorID}>
                {isNewLetter && letter && (
                  <div
                    ref={(el) => { letterRefs.current[letter] = el; }}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                      fontSize: 11,
                      color: "#afada9",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      padding: "14px 0 4px",
                      scrollMarginTop: 80,
                    }}
                  >
                    {letter}
                  </div>
                )}
                <VendorCard
                  vendor={vendor}
                  expanded={expandedID === vendor.vendorID}
                  onToggle={() => toggle(vendor.vendorID)}
                  selectedMarket={selectedMarket}
                  allMarkets={allMarkets}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VendorCard({
  vendor,
  expanded,
  onToggle,
  selectedMarket,
  allMarkets,
}: {
  vendor: Vendor;
  expanded: boolean;
  onToggle: () => void;
  selectedMarket: number | null;
  allMarkets: Record<number, string>;
}) {
  const relevantMarkets = selectedMarket
    ? vendor.markets.filter((m) => m.marketID === selectedMarket)
    : vendor.markets.filter((m) => allMarkets[m.marketID]);

  const next = nextDate(vendor.markets, selectedMarket);
  const phone = formatPhone(vendor.phone1);
  const location = formatCity(vendor.city, vendor.state);
  const tags = autoTag(vendor);

  const marketBadges = vendor.markets
    .filter((m) => MARKET_SHORT[m.marketID])
    .sort((a, b) => (MARKET_SHORT[a.marketID] ?? "").localeCompare(MARKET_SHORT[b.marketID] ?? ""));

  return (
    <div style={{ borderBottom: "1px solid #e8e8e0" }}>
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          {vendor.photo ? (
            <img
              src={vendor.photo}
              alt={vendor.company}
              style={{ width: 48, height: 48, objectFit: "cover", flexShrink: 0, borderRadius: 4, border: "1px solid #e8e8e0" }}
            />
          ) : (
            <div style={{
              width: 48, height: 48, backgroundColor: "#ecebd8", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 4, border: "1px solid #e8e8e0",
            }}>
              <span style={{ fontSize: 18, fontFamily: "var(--font-heading)", color: "#0d8240", fontWeight: 500 }}>
                {vendor.company.charAt(0)}
              </span>
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 500,
              fontSize: 16,
              color: "#000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {vendor.company}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
              {location && (
                <span style={{ fontSize: 13, color: "#494949" }}>{location}</span>
              )}
              {next && (
                <>
                  {location && <span style={{ fontSize: 10, color: "#d8d8d8" }}>·</span>}
                  <span style={{ fontSize: 12, color: "#0d8240", fontWeight: 500 }}>
                    Next: {next}
                  </span>
                </>
              )}
            </div>

            {/* Category tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    backgroundColor: "#f0f5f1",
                    border: "1px solid #c8dece",
                    borderRadius: 10,
                    color: "#0d8240",
                    whiteSpace: "nowrap",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Market badges — only in all-markets view */}
            {!selectedMarket && marketBadges.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                {marketBadges.map((m) => (
                  <span key={m.marketID} style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    backgroundColor: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 10,
                    color: "#494949",
                    whiteSpace: "nowrap",
                  }}>
                    {MARKET_SHORT[m.marketID]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <span style={{
          flexShrink: 0,
          width: 22, height: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0d8240", fontSize: 18, lineHeight: 1,
        }}>
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: "4px 0 24px",
          borderTop: "1px solid #e8e8e0",
          marginTop: -1,
        }}>

          {/* Top section: photo + description side by side */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, marginTop: 16 }}>
            {vendor.photo && (
              <img
                src={vendor.photo}
                alt={vendor.company}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  flexShrink: 0,
                  borderRadius: 4,
                  border: "1px solid #e8e8e0",
                  alignSelf: "flex-start",
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {vendor.description && (
                <p style={{ margin: "0 0 14px", color: "#494949", fontSize: 14, lineHeight: 1.7 }}>
                  {vendor.description}
                </p>
              )}

              {/* Contact links */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 13 }}>
                {phone && (
                  <a href={`tel:${vendor.phone1}`} style={{ color: "#0d8240", textDecoration: "none" }}>
                    Phone: {phone}
                  </a>
                )}
                {vendor.website?.trim() && vendor.website.trim() !== " " && (
                  <a
                    href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: "#0d8240", textDecoration: "none" }}
                  >
                    Website ↗
                  </a>
                )}
                {vendor.instagram_profile?.trim() && vendor.instagram_profile.trim() !== " " && (
                  <a href={vendor.instagram_profile} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#0d8240", textDecoration: "none" }}>
                    Instagram ↗
                  </a>
                )}
                {vendor.facebook_profile?.trim() && vendor.facebook_profile.trim() !== " " && (
                  <a href={vendor.facebook_profile} target="_blank" rel="noopener noreferrer"
                    style={{ color: "#0d8240", textDecoration: "none" }}>
                    Facebook ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Market dates */}
          {relevantMarkets.length > 0 && (
            <div style={{
              borderTop: "1px solid #e8e8e0",
              paddingTop: 16,
            }}>
              {relevantMarkets.map((m) => {
                const grouped = groupByMonth(m.dates ?? []);
                const months = Object.entries(grouped);
                return (
                  <div key={m.marketID} style={{ marginBottom: 12 }}>
                    <div style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#0d8240",
                      marginBottom: 10,
                    }}>
                      {allMarkets[m.marketID] ?? m.market} Dates
                    </div>
                    {months.length === 0 ? (
                      <span style={{ fontSize: 13, color: "#afada9" }}>Dates TBD</span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {months.map(([month, days]) => (
                          <div key={month} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                            <span style={{
                              fontSize: 12, color: "#494949", fontWeight: 500,
                              minWidth: 72, flexShrink: 0,
                            }}>
                              {month.replace(/\s*\d{4}$/, "")}
                            </span>
                            <span style={{ fontSize: 13, color: "#000", lineHeight: 1.6 }}>
                              {days.join(" · ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

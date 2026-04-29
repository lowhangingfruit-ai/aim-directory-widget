"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < 600);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { cols: narrow ? 1 : 2, px: narrow ? 20 : 32 };
}

// ── Shared label style ─────────────────────────────────────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#aaa",
};

// ── Pill ──────────────────────────────────────────────────────────────────────
function Pill({ label, count, active, onClick, size = "md" }: {
  label: string; count?: number; active: boolean; onClick: () => void; size?: "sm" | "md";
}) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: size === "sm" ? "4px 10px" : "6px 14px",
      fontFamily: "var(--font-body)",
      fontSize: size === "sm" ? 12 : 13,
      cursor: "pointer",
      border: `1px solid ${active ? "#0d8240" : "#d8d8d8"}`,
      borderRadius: 20,
      backgroundColor: active ? "#0d8240" : "#fff",
      color: active ? "#fff" : "#494949",
      transition: "all 0.12s ease",
      whiteSpace: "nowrap",
    }}>
      {label}
      {count !== undefined && (
        <span style={{ marginLeft: 5, fontSize: 11, opacity: active ? 0.8 : 0.5 }}>{count}</span>
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DirectoryClient({ vendors, marketID, marketName, allMarkets }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(marketID ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedID, setExpandedID] = useState<number | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { cols, px } = useLayout();

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
    if (selectedCategory) list = list.filter((v) => autoTag(v).includes(selectedCategory));
    return list;
  }, [vendors, selectedMarket, search, selectedDate, selectedCategory]);

  const availableCategories = useMemo(() => {
    let list = vendors;
    if (selectedMarket) list = list.filter((v) => v.markets.some((m) => m.marketID === selectedMarket));
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((v) => v.company.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q));
    if (selectedDate) list = list.filter((v) => v.markets.some((m) => {
      if (selectedMarket && m.marketID !== selectedMarket) return false;
      return (m.dates ?? []).some((d) => dateKey(parseDate(d)) === selectedDate);
    }));
    const counts: Record<string, number> = {};
    for (const v of list) {
      for (const tag of autoTag(v)) counts[tag] = (counts[tag] ?? 0) + 1;
    }
    return CATEGORIES.filter((c) => counts[c.label]).map((c) => ({ label: c.label, count: counts[c.label] }));
  }, [vendors, selectedMarket, search, selectedDate]);

  // Group filtered vendors by first letter
  const grouped = useMemo(() => {
    const groups: { letter: string; vendors: Vendor[] }[] = [];
    let current: { letter: string; vendors: Vendor[] } | null = null;
    for (const v of filtered) {
      const letter = v.company[0]?.toUpperCase() || "#";
      if (!current || current.letter !== letter) {
        current = { letter, vendors: [] };
        groups.push(current);
      }
      current.vendors.push(v);
    }
    return groups;
  }, [filtered]);

  const letters = useMemo(() => grouped.map((g) => g.letter), [grouped]);

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

  const hasActiveFilter = !!(selectedDate || selectedCategory || search);
  const displayTitle = selectedMarket
    ? (allMarkets[selectedMarket] ?? marketName ?? "Market Participants")
    : marketName ?? "All Market Participants";

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>

      {/* ── Sticky filter header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: "#f6f5ea",
        borderBottom: "1px solid #dddcd3",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        padding: `14px ${px}px 12px`,
      }}>
        {/* Market pills */}
        {!marketID && (
          <div style={scrollRowStyle}>
            {marketOptions.map((m) => (
              <Pill key={m.id} label={m.name} count={m.count}
                active={selectedMarket === m.id} onClick={() => handleMarketSelect(m.id)} />
            ))}
          </div>
        )}

        {/* Date chips */}
        {selectedMarket && dateChips.length > 0 && (
          <div style={scrollRowStyle}>
            <span style={{ ...LABEL_STYLE, alignSelf: "center", flexShrink: 0, marginRight: 4 }}>Date</span>
            {dateChips.map((d) => {
              const key = dateKey(d);
              return (
                <Pill key={key} label={fmtDateChip(d)} active={selectedDate === key} size="sm"
                  onClick={() => { setSelectedDate((p) => (p === key ? null : key)); setExpandedID(null); }} />
              );
            })}
          </div>
        )}

        {/* Category chips */}
        {availableCategories.length > 0 && (
          <div style={scrollRowStyle}>
            <span style={{ ...LABEL_STYLE, alignSelf: "center", flexShrink: 0, marginRight: 4 }}>Category</span>
            {availableCategories.map(({ label, count }) => (
              <Pill key={label} label={label} count={count} active={selectedCategory === label} size="sm"
                onClick={() => { setSelectedCategory((p) => (p === label ? null : label)); setExpandedID(null); }} />
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b0aea9", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search vendors, products, city…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 36px",
              fontFamily: "var(--font-body)", fontSize: 14,
              border: "1px solid #d8d8d8", borderRadius: 6,
              backgroundColor: "#fff", color: "#000",
              outline: "none", boxSizing: "border-box",
            }} />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#afada9", fontSize: 16, lineHeight: 1, padding: 2,
            }}>×</button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: `0 ${px}px 48px` }}>

        {/* Title row */}
        <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 3 }}>
              {displayTitle}
            </h2>
            <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>
              {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"}
              {selectedDate && ` · ${selectedDate}`}
              {selectedCategory && ` · ${selectedCategory}`}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
          {hasActiveFilter && (
            <button onClick={() => { setSelectedDate(null); setSelectedCategory(null); setSearch(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#0d8240", fontSize: 12, padding: 0, textDecoration: "underline" }}>
              Clear filters
            </button>
          )}
        </div>

        {/* A–Z jump nav */}
        {filtered.length > 24 && letters.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 16, borderBottom: "1px solid #e8e8e0", paddingBottom: 12 }}>
            {letters.map((l) => (
              <button key={l} onClick={() => jumpTo(l)} style={{
                width: 26, height: 26,
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 11,
                cursor: "pointer", border: "none", borderRadius: 4,
                backgroundColor: activeLetter === l ? "#0d8240" : "transparent",
                color: activeLetter === l ? "#fff" : "#0d8240",
                transition: "all 0.1s ease", padding: 0,
              }}>{l}</button>
            ))}
          </div>
        )}

        {/* Vendor list */}
        {filtered.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", padding: "64px 0" }}>No vendors found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {grouped.map(({ letter, vendors: group }) => (
              <div key={letter}>
                {/* Letter header */}
                <div
                  ref={(el) => { letterRefs.current[letter] = el; }}
                  style={{
                    ...LABEL_STYLE,
                    color: "#bbb",
                    padding: "0 0 8px",
                    marginBottom: 4,
                    borderBottom: "1px solid #e8e8e0",
                    scrollMarginTop: 120,
                  }}
                >
                  {letter}
                </div>

                {/* Cards grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: 8,
                }}>
                  {group.map((vendor) => (
                    <VendorCard
                      key={vendor.vendorID}
                      vendor={vendor}
                      expanded={expandedID === vendor.vendorID}
                      onToggle={() => setExpandedID((p) => (p === vendor.vendorID ? null : vendor.vendorID))}
                      selectedMarket={selectedMarket}
                      allMarkets={allMarkets}
                      cols={cols}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Vendor card ────────────────────────────────────────────────────────────────
function VendorCard({ vendor, expanded, onToggle, selectedMarket, allMarkets, cols }: {
  vendor: Vendor;
  expanded: boolean;
  onToggle: () => void;
  selectedMarket: number | null;
  allMarkets: Record<number, string>;
  cols: number;
}) {
  const [hovered, setHovered] = useState(false);

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

  const hasContact = !!(phone || vendor.website?.trim() || vendor.instagram_profile?.trim() || vendor.facebook_profile?.trim());

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: expanded && cols > 1 ? "1 / -1" : undefined,
        background: expanded ? "#fafaf8" : hovered ? "#fafaf8" : "#fff",
        borderTop: "1px solid #e8e8e0",
        borderRight: "1px solid #e8e8e0",
        borderBottom: "1px solid #e8e8e0",
        borderLeft: `3px solid ${expanded ? "#0d8240" : hovered ? "#4db448" : "#dddcd3"}`,
        borderRadius: 6,
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-left-color 0.15s ease, background 0.15s ease",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Collapsed row ── */}
      <div style={{ padding: "14px 14px 14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
            color: "#111", marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {vendor.company}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {location && <span style={{ fontSize: 12, color: "#888" }}>{location}</span>}
            {location && next && <span style={{ fontSize: 10, color: "#ddd" }}>·</span>}
            {next && <span style={{ fontSize: 12, color: "#0d8240", fontWeight: 600 }}>Next: {next}</span>}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* ── Expanded detail: two columns ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e8e8e0", display: "flex", alignItems: "stretch" }}>

          {/* Left: description */}
          <div style={{
            flex: "0 0 55%",
            padding: "16px 20px",
            borderRight: "1px solid #e8e8e0",
          }}>
            {vendor.description ? (
              <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.75 }}>
                {vendor.description}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "#bbb", fontStyle: "italic" }}>No description available.</p>
            )}
          </div>

          {/* Right: meta */}
          <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

            {/* Contact */}
            {hasContact && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={LABEL_STYLE}>Contact</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                  {phone && (
                    <a href={`tel:${vendor.phone1}`} onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500 }}>
                      {phone}
                    </a>
                  )}
                  {vendor.website?.trim() && vendor.website.trim() !== " " && (
                    <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                      target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500 }}>
                      Website ↗
                    </a>
                  )}
                  {vendor.instagram_profile?.trim() && vendor.instagram_profile.trim() !== " " && (
                    <a href={vendor.instagram_profile} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500 }}>
                      Instagram ↗
                    </a>
                  )}
                  {vendor.facebook_profile?.trim() && vendor.facebook_profile.trim() !== " " && (
                    <a href={vendor.facebook_profile} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500 }}>
                      Facebook ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={LABEL_STYLE}>Category</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 11, padding: "3px 8px",
                      backgroundColor: "#f0f8f3", border: "1px solid #c8dece",
                      borderRadius: 4, color: "#0d8240",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Market badges (all-markets view) */}
            {!selectedMarket && marketBadges.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={LABEL_STYLE}>Markets</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {marketBadges.map((m) => (
                    <span key={m.marketID} style={{
                      fontSize: 11, padding: "3px 8px",
                      backgroundColor: "#f6f5ea", border: "1px solid #dddcd3",
                      borderRadius: 4, color: "#666",
                    }}>{MARKET_SHORT[m.marketID]}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Market dates */}
            {relevantMarkets.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {relevantMarkets.map((m) => {
                  const grouped = groupByMonth(m.dates ?? []);
                  const months = Object.entries(grouped);
                  return (
                    <div key={m.marketID}>
                      <div style={{ ...LABEL_STYLE, color: "#0d8240", marginBottom: 6 }}>
                        Attending {allMarkets[m.marketID] ?? m.market}
                      </div>
                      {months.length === 0 ? (
                        <span style={{ fontSize: 12, color: "#aaa" }}>Dates TBD</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {months.map(([month, days]) => (
                            <div key={month} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                              <span style={{ fontSize: 11, color: "#888", fontWeight: 600, minWidth: 52, flexShrink: 0 }}>
                                {month.replace(/\s*\d{4}$/, "")}
                              </span>
                              <span style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>
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
        </div>
      )}
    </div>
  );
}

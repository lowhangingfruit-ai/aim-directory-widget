"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Vendor, VendorMarket } from "@/lib/types";

const VendorMap = dynamic(() => import("./VendorMap"), { ssr: false });

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
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < 600);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { cols: narrow ? 1 : 2, px: narrow ? 20 : 32, narrow };
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
function Pill({ label, count, active, onClick, size = "md", color, isNext }: {
  label: string; count?: number; active: boolean; onClick: () => void;
  size?: "sm" | "md"; color?: string; isNext?: boolean;
}) {
  const activeColor = color ?? "#0d8240";
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: size === "sm" ? "4px 10px" : "6px 14px",
      fontFamily: "var(--font-body)",
      fontSize: size === "sm" ? 12 : 13,
      cursor: "pointer",
      border: `1px solid ${active ? activeColor : isNext ? "#0d824055" : color ? `${color}55` : "#d8d8d8"}`,
      borderRadius: 0,
      backgroundColor: active ? activeColor : "#fff",
      color: active ? "#fff" : isNext ? "#0d8240" : color ? activeColor : "#494949",
      transition: "all 0.12s ease",
      whiteSpace: "nowrap",
      fontWeight: active || isNext ? 600 : 400,
    }}>
      {isNext && !active && <span style={{ marginRight: 4, fontSize: 9 }}>●</span>}
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedID, setExpandedID] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [hoveredMarket, setHoveredMarket] = useState<number | null>(null);
  const { cols, px, narrow } = useLayout();

  useEffect(() => {
    const el = document.getElementById("aim-directory-root");
    const onScroll = () => setShowBackToTop((el?.scrollTop ?? window.scrollY) > 400);
    const target = el ?? window;
    target.addEventListener("scroll", onScroll);
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

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
  }, [vendors, selectedMarket, search, selectedDate]);

  // When market selected: single flat group (sorted by date). Otherwise: letter groups.
  const grouped = useMemo(() => {
    if (selectedMarket) {
      return [{ letter: "_", vendors: filtered }];
    }
    const letterGroups: { letter: string; vendors: Vendor[] }[] = [];
    const numericGroups: { letter: string; vendors: Vendor[] }[] = [];
    let currentLetter: { letter: string; vendors: Vendor[] } | null = null;
    let currentNum: { letter: string; vendors: Vendor[] } | null = null;
    for (const v of filtered) {
      const first = v.company[0]?.toUpperCase() || "#";
      const isNumeric = /\d/.test(first);
      if (isNumeric) {
        if (!currentNum || currentNum.letter !== first) {
          currentNum = { letter: first, vendors: [] };
          numericGroups.push(currentNum);
        }
        currentNum.vendors.push(v);
      } else {
        if (!currentLetter || currentLetter.letter !== first) {
          currentLetter = { letter: first, vendors: [] };
          letterGroups.push(currentLetter);
        }
        currentLetter.vendors.push(v);
      }
    }
    return [...letterGroups, ...numericGroups];
  }, [filtered, selectedMarket]);

  const handleMarketSelect = (id: number) => {
    setSelectedMarket((prev) => (prev === id ? null : id));
    setSelectedDate(null);
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

  function FadeRow({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ position: "relative" }}>
        <div style={scrollRowStyle}>{children}</div>
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 10,
          width: 40, pointerEvents: "none",
          background: "linear-gradient(to right, transparent, #f6f5ea)",
        }} />
      </div>
    );
  }

  const hasActiveFilter = !!(selectedDate || search);

  return (
    <div id="aim-directory-root" style={{ fontFamily: "var(--font-body)", position: "relative" }}>

      {/* ── Sticky filter header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: "#f6f5ea",
        borderBottom: "1px solid #dddcd3",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
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
                  style={{
                    flexShrink: 0, border: "none", background: "none",
                    cursor: "pointer", padding: "0 2px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  }}
                >
                  <div style={{
                    width: 80, height: 80,
                    outline: active ? `2px solid ${color}` : hovered ? "2px solid #ccc" : "2px solid transparent",
                    outlineOffset: 2,
                    overflow: "hidden",
                    opacity: selectedMarket && !active ? 0.45 : 1,
                    transition: "outline 0.12s ease, opacity 0.12s ease",
                  }}>
                    {MARKET_LOGOS[m.id] ? (
                      <img src={MARKET_LOGOS[m.id]} alt={m.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: color }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-body)", lineHeight: 1.3,
                    textAlign: "center", maxWidth: 84,
                    color: active ? color : "#555",
                    fontWeight: active ? 700 : 400,
                  }}>{m.name}</span>
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
            <span style={{ ...LABEL_STYLE, alignSelf: "center", flexShrink: 0, marginRight: 4 }}>Date</span>
            {dateChips.map((d, i) => {
              const key = dateKey(d);
              return (
                <Pill key={key} label={fmtDateChip(d)} active={selectedDate === key} size="sm"
                  isNext={i === 0}
                  onClick={() => { setSelectedDate((p) => (p === key ? null : key)); setExpandedID(null); }} />
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
          <input type="text" placeholder="Search vendors, products, city…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 36px",
              fontFamily: "var(--font-body)", fontSize: 14,
              border: "1px solid #d8d8d8", borderRadius: 0,
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

        {/* Count + toggle row */}
        <div style={{ padding: "16px 0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <p style={{ fontSize: 13, margin: 0, color: "#555" }}>
            <span style={{ fontWeight: 600, color: "#111" }}>{filtered.length}</span>
            {" "}{filtered.length === 1 ? "vendor" : "vendors"}
            {selectedMarket && !selectedDate && ` at ${allMarkets[selectedMarket]}`}
            {selectedDate && ` attending ${selectedDate}`}
            {search ? ` matching "${search}"` : ""}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasActiveFilter && (
              <button onClick={() => { setSelectedDate(null); setSearch(""); }}
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
            selectedMarket={selectedMarket}
            allMarkets={allMarkets}
            marketColor={selectedMarket ? MARKET_COLORS[selectedMarket] : "#0d8240"}
          />
        )}

        {/* Vendor list */}
        {view === "list" && (filtered.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", padding: "64px 0" }}>No vendors found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {grouped.map(({ letter, vendors: group }) => (
              <div key={letter} style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                alignItems: "start",
                gap: 8,
              }}>
                {group.map((vendor) => (
                  <VendorCard
                    key={vendor.vendorID}
                    vendor={vendor}
                    expanded={expandedID === vendor.vendorID}
                    onToggle={() => setExpandedID((p) => (p === vendor.vendorID ? null : vendor.vendorID))}
                    selectedMarket={selectedMarket}
                    selectedDate={selectedDate}
                    allMarkets={allMarkets}
                    cols={cols}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Back to top */}
      {showBackToTop && (
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

// ── Vendor card ────────────────────────────────────────────────────────────────
function VendorCard({ vendor, expanded, onToggle, selectedMarket, selectedDate, allMarkets, cols }: {
  vendor: Vendor;
  expanded: boolean;
  onToggle: () => void;
  selectedMarket: number | null;
  selectedDate: string | null;
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
  const hasNoUpcomingDate = nextDateTimestamp(vendor, selectedMarket) === Infinity;

  const marketBadges = vendor.markets
    .filter((m) => MARKET_SHORT[m.marketID])
    .sort((a, b) => (MARKET_SHORT[a.marketID] ?? "").localeCompare(MARKET_SHORT[b.marketID] ?? ""));

  const hasContact = !!(phone || vendor.website?.trim() || vendor.instagram_profile?.trim() || vendor.facebook_profile?.trim());

  // Short description snippet for collapsed preview
  const descSnippet = vendor.description?.trim()
    ? vendor.description.trim().slice(0, 90) + (vendor.description.trim().length > 90 ? "…" : "")
    : null;

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: expanded && cols > 1 ? "1 / -1" : undefined,
        background: expanded ? "#fafaf8" : "#fff",
        border: "1px solid #e8e8e0",
        borderRadius: 0,
        cursor: "pointer",
        overflow: "hidden",
        transition: "box-shadow 0.15s ease, background 0.15s ease",
        boxShadow: hovered || expanded ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
        fontFamily: "var(--font-body)",
        opacity: hasNoUpcomingDate && selectedMarket && !expanded ? 0.55 : 1,
      }}
    >
      {/* ── Collapsed row ── */}
      <div style={{ padding: "14px 14px 14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15,
            color: hasNoUpcomingDate && selectedMarket ? "#999" : "#111",
            marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {displayName(vendor.company)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: descSnippet ? 5 : 0 }}>
            {location && <span style={{ fontSize: 12, color: "#888" }}>{location}</span>}
            {next && !selectedDate && <span style={{ fontSize: 10, color: "#ddd" }}>·</span>}
            {next && !selectedDate && <span style={{ fontSize: 12, color: "#0d8240", fontWeight: 600 }}>Next: {next}</span>}
            {!next && selectedMarket && <span style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Dates TBD</span>}
          </div>
          {descSnippet && !expanded && (
            <p style={{ margin: 0, fontSize: 12, color: "#999", lineHeight: 1.5 }}>{descSnippet}</p>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 2, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e8e8e0", display: "flex", alignItems: "stretch", flexDirection: vendor.description ? "row" : "column" }}>

          {/* Left: description — only shown when there is one */}
          {vendor.description && (
            <div style={{ flex: "0 0 55%", padding: "16px 20px", borderRight: "1px solid #e8e8e0" }}>
              <div style={{ ...LABEL_STYLE, marginBottom: 8 }}>About</div>
              <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.75 }}>
                {vendor.description}
              </p>
            </div>
          )}

          {/* Right (or full-width): meta */}
          <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

            {/* Contact with icons */}
            {hasContact && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={LABEL_STYLE}>Contact</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "center" }}>
                  {phone && (
                    <a href={`tel:${vendor.phone1}`} onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {phone}
                    </a>
                  )}
                  {vendor.website?.trim() && vendor.website.trim() !== " " && (
                    <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                      target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      Website
                    </a>
                  )}
                  {vendor.instagram_profile?.trim() && vendor.instagram_profile.trim() !== " " && (
                    <a href={vendor.instagram_profile} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      Instagram
                    </a>
                  )}
                  {vendor.facebook_profile?.trim() && vendor.facebook_profile.trim() !== " " && (
                    <a href={vendor.facebook_profile} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: "#0d8240", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      Facebook
                    </a>
                  )}
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
                      borderRadius: 0, color: "#666",
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

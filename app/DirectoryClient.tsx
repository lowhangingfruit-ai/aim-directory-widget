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

export default function DirectoryClient({ vendors, marketID, marketName, allMarkets }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(marketID ?? null);
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
    return list;
  }, [vendors, selectedMarket, search]);

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
    setExpandedID(null);
    setSearch("");
  };

  const displayTitle = selectedMarket
    ? (allMarkets[selectedMarket] ?? marketName ?? "Market Participants")
    : marketName ?? "All Market Participants";

  return (
    <div style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>

      {/* Market filter — horizontal scroll on mobile */}
      {!marketID && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            fontFamily: "var(--font-heading)",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#494949",
            marginBottom: 10,
          }}>
            Filter by Market
          </div>
          <div style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
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
                    padding: "6px 14px",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    cursor: "pointer",
                    border: `1px solid ${active ? "#0d8240" : "#d8d8d8"}`,
                    borderRadius: 0,
                    backgroundColor: active ? "#0d8240" : "#fff",
                    color: active ? "#fff" : "#494949",
                    transition: "all 0.12s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.name}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{m.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header + search */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: 26,
          fontWeight: 500,
          color: "#000",
          marginBottom: 4,
        }}>
          {displayTitle}
        </h2>
        <p style={{ color: "#494949", fontSize: 14, margin: "0 0 14px" }}>
          {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"}
          {search ? ` matching "${search}"` : ""}
        </p>
        <input
          type="text"
          placeholder="Search vendors, products, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            border: "1px solid #d8d8d8",
            borderRadius: 0,
            backgroundColor: "#fff",
            color: "#000",
            outline: "none",
          }}
        />
      </div>

      {/* A–Z jump nav */}
      {filtered.length > 20 && letters.length > 1 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          marginBottom: 16,
          borderBottom: "1px solid #d8d8d8",
          paddingBottom: 12,
        }}>
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => jumpTo(l)}
              style={{
                width: 28,
                height: 28,
                fontFamily: "var(--font-heading)",
                fontWeight: 500,
                fontSize: 13,
                cursor: "pointer",
                border: "none",
                borderRadius: 0,
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
          <p style={{ color: "#494949", textAlign: "center", padding: "40px 0" }}>
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
                    fontSize: 13,
                    color: "#afada9",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "10px 0 4px",
                    scrollMarginTop: 8,
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

  // Market badges: only known 2026 markets, sorted
  const marketBadges = vendor.markets
    .filter((m) => MARKET_SHORT[m.marketID])
    .sort((a, b) => (MARKET_SHORT[a.marketID] ?? "").localeCompare(MARKET_SHORT[b.marketID] ?? ""));

  return (
    <div style={{
      borderBottom: "1px solid #d8d8d8",
      backgroundColor: expanded ? "#fff" : "transparent",
      transition: "background-color 0.15s ease",
    }}>
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
          {vendor.photo ? (
            <img
              src={vendor.photo}
              alt={vendor.company}
              style={{ width: 48, height: 48, objectFit: "cover", flexShrink: 0, border: "1px solid #d8d8d8" }}
            />
          ) : (
            <div style={{
              width: 48, height: 48, backgroundColor: "#f2f2f2", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid #d8d8d8",
            }}>
              <span style={{ fontSize: 18, color: "#afada9" }}>{vendor.company.charAt(0)}</span>
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

            {/* City + next date on same row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
              {vendor.city && (
                <span style={{ fontSize: 13, color: "#494949" }}>{vendor.city}</span>
              )}
              {next && (
                <>
                  {vendor.city && <span style={{ fontSize: 11, color: "#d8d8d8" }}>·</span>}
                  <span style={{ fontSize: 12, color: "#0d8240", fontWeight: 500 }}>
                    Next: {next}
                  </span>
                </>
              )}
            </div>

            {/* Market badges */}
            {!selectedMarket && marketBadges.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {marketBadges.map((m) => (
                  <span key={m.marketID} style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    backgroundColor: "#f2f2f2",
                    border: "1px solid #e0e0e0",
                    color: "#494949",
                    fontFamily: "var(--font-body)",
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
          flexShrink: 0, width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0d8240", fontSize: 20, lineHeight: 1,
        }}>
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 0 20px 62px" }}>
          {vendor.description && (
            <p style={{ margin: "0 0 16px", color: "#494949", fontSize: 14, lineHeight: 1.65 }}>
              {vendor.description}
            </p>
          )}

          {/* Contact links */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", marginBottom: 16, fontSize: 14 }}>
            {vendor.phone1 && (
              <a href={`tel:${vendor.phone1}`} style={{ color: "#0d8240", textDecoration: "none" }}>
                Phone: {vendor.phone1}
              </a>
            )}
            {vendor.website?.trim() && (
              <a
                href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                target="_blank" rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}
              >
                Website
              </a>
            )}
            {vendor.instagram_profile?.trim() && (
              <a href={vendor.instagram_profile} target="_blank" rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}>
                Instagram
              </a>
            )}
            {vendor.facebook_profile?.trim() && (
              <a href={vendor.facebook_profile} target="_blank" rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}>
                Facebook
              </a>
            )}
          </div>

          {/* Dates grouped by month */}
          {relevantMarkets.length > 0 && (
            <div>
              {relevantMarkets.map((m) => {
                const grouped = groupByMonth(m.dates ?? []);
                const months = Object.entries(grouped);
                return (
                  <div key={m.marketID} style={{ marginBottom: 14 }}>
                    <div style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#494949",
                      marginBottom: 8,
                    }}>
                      {allMarkets[m.marketID] ?? m.market}
                    </div>
                    {months.length === 0 ? (
                      <span style={{ fontSize: 13, color: "#afada9" }}>Dates TBD</span>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {months.map(([month, days]) => (
                          <div key={month} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                            <span style={{
                              fontSize: 12,
                              color: "#494949",
                              fontWeight: 500,
                              minWidth: 80,
                              flexShrink: 0,
                            }}>
                              {month.replace(/\s*\d{4}$/, "")}
                            </span>
                            <span style={{ fontSize: 13, color: "#000" }}>
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

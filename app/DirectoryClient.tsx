"use client";

import { useState, useMemo } from "react";
import { Vendor } from "@/lib/types";

interface Props {
  vendors: Vendor[];
  marketID?: number;
  marketName?: string;
  allMarkets: Record<number, string>;
}

export default function DirectoryClient({ vendors, marketID, marketName, allMarkets }: Props) {
  const [search, setSearch] = useState("");
  const [expandedID, setExpandedID] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        v.company.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const toggle = (id: number) => setExpandedID((prev) => (prev === id ? null : id));

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: 26,
          fontWeight: 500,
          color: "#000",
          marginBottom: 4,
        }}>
          {marketName ? `${marketName} Market Participants` : "All Market Participants"}
        </h2>
        <p style={{ color: "#494949", fontSize: 14, margin: "0 0 16px" }}>
          {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"}
          {search ? ` matching "${search}"` : ""}
        </p>

        {/* Search */}
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

      {/* Vendor list */}
      <div>
        {filtered.length === 0 && (
          <p style={{ color: "#494949", textAlign: "center", padding: "40px 0" }}>
            No vendors found.
          </p>
        )}
        {filtered.map((vendor) => (
          <VendorCard
            key={vendor.vendorID}
            vendor={vendor}
            expanded={expandedID === vendor.vendorID}
            onToggle={() => toggle(vendor.vendorID)}
            marketID={marketID}
            allMarkets={allMarkets}
          />
        ))}
      </div>
    </div>
  );
}

function VendorCard({
  vendor,
  expanded,
  onToggle,
  marketID,
  allMarkets,
}: {
  vendor: Vendor;
  expanded: boolean;
  onToggle: () => void;
  marketID?: number;
  allMarkets: Record<number, string>;
}) {
  const relevantMarkets = marketID
    ? vendor.markets.filter((m) => m.marketID === marketID)
    : vendor.markets;

  return (
    <div
      style={{
        borderBottom: "1px solid #d8d8d8",
        backgroundColor: expanded ? "#fff" : "transparent",
        transition: "background-color 0.15s ease",
      }}
    >
      {/* Row — always visible */}
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
          {/* Photo */}
          {vendor.photo ? (
            <img
              src={vendor.photo}
              alt={vendor.company}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 0,
                flexShrink: 0,
                border: "1px solid #d8d8d8",
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#f2f2f2",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #d8d8d8",
              }}
            >
              <span style={{ fontSize: 18, color: "#afada9" }}>
                {vendor.company.charAt(0)}
              </span>
            </div>
          )}

          <div style={{ minWidth: 0 }}>
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
            <div style={{ fontSize: 13, color: "#494949", marginTop: 2 }}>
              {vendor.city && <span>{vendor.city}</span>}
              {vendor.type && vendor.city && <span style={{ margin: "0 6px", color: "#d8d8d8" }}>·</span>}
              {vendor.type && <span>{vendor.type}</span>}
            </div>
          </div>
        </div>

        {/* Toggle icon */}
        <span style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0d8240",
          fontSize: 20,
          fontFamily: "var(--font-body)",
          lineHeight: 1,
        }}>
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 0 20px 62px" }}>
          {vendor.description && (
            <p style={{ margin: "0 0 16px", color: "#494949", fontSize: 14, lineHeight: 1.65 }}>
              {vendor.description}
            </p>
          )}

          {/* Contact row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", marginBottom: 16, fontSize: 14 }}>
            {vendor.phone1 && (
              <a href={`tel:${vendor.phone1}`} style={{ color: "#0d8240", textDecoration: "none" }}>
                {vendor.phone1}
              </a>
            )}
            {vendor.website && (
              <a
                href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}
              >
                Website
              </a>
            )}
            {vendor.instagram_profile && (
              <a
                href={vendor.instagram_profile}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}
              >
                Instagram
              </a>
            )}
            {vendor.facebook_profile && (
              <a
                href={vendor.facebook_profile}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0d8240", textDecoration: "none" }}
              >
                Facebook
              </a>
            )}
          </div>

          {/* Market dates */}
          {relevantMarkets.length > 0 && (
            <div>
              {relevantMarkets.map((m) => (
                <div key={m.marketID} style={{ marginBottom: 12 }}>
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#494949",
                    marginBottom: 6,
                  }}>
                    {allMarkets[m.marketID] ?? m.market}
                  </div>
                  {m.dates && m.dates.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {m.dates.map((d) => (
                        <span
                          key={d}
                          style={{
                            fontSize: 12,
                            padding: "3px 8px",
                            backgroundColor: "#f2f2f2",
                            border: "1px solid #d8d8d8",
                            color: "#494949",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: "#afada9" }}>Dates TBD</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

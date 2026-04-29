import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import DirectoryClient from "./DirectoryClient";

async function getVendors(marketID?: string): Promise<Vendor[]> {
  const url = marketID
    ? `https://managemymarket.com/api/VendorList?orgID=${ORG_ID}&marketID=${marketID}`
    : `https://managemymarket.com/api/VendorList?orgID=${ORG_ID}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        "Referer": "https://www.agriculturalinstitute.org/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const match = text.match(/var mmmVendors = (\[[\s\S]*?\]);/);
    if (!match) return [];
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ marketID?: string }>;
}) {
  const { marketID } = await searchParams;
  const vendors = await getVendors(marketID);
  const marketName = marketID ? MARKETS[Number(marketID)] : undefined;

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px 60px" }}>
      {/* Page wrapper */}
      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        backgroundColor: "#f6f5ea",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.08)",
        borderRadius: "0 0 8px 8px",
        overflow: "hidden",
      }}>

        {/* Page header */}
        <div style={{
          padding: "clamp(20px, 4vw, 36px) clamp(20px, 4vw, 32px) 28px",
          borderBottom: "1px solid #d8d8d8",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#0d8240",
            }}>
              Agricultural Institute of Marin
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: 32,
            fontWeight: 500,
            color: "#000",
            margin: "0 0 8px",
            lineHeight: 1.2,
          }}>
            {marketName ? `${marketName} Vendors` : "Market Participant Directory"}
          </h1>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: "#494949",
            maxWidth: 520,
            lineHeight: 1.6,
          }}>
            Find farms, food makers, and artisans at AIM farmers markets across the Bay Area.
            Filter by market, date, or product category.
          </p>
        </div>

        {/* Directory */}
        <DirectoryClient
          vendors={vendors}
          marketID={marketID ? Number(marketID) : undefined}
          marketName={marketName}
          allMarkets={MARKETS}
        />
      </div>
    </div>
  );
}

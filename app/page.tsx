import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { PaymentMap, samplePayments } from "@/lib/payments";
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
    return parseVendorFeed(text);
  } catch {
    return [];
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ marketID?: string; preview?: string }>;
}) {
  const { marketID, preview } = await searchParams;
  const vendors = await getVendors(marketID);
  const marketName = marketID ? MARKETS[Number(marketID)] : undefined;

  // Real payment answers arrive with the intake Sheet. Until then, payment
  // badges and filters only appear on the review link, with sample data.
  const paymentPreview = preview === "payments";
  const payments: PaymentMap = paymentPreview ? samplePayments(vendors.map((v) => v.vendorID)) : {};

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {paymentPreview && (
        <div style={{
          backgroundColor: "#4db547", color: "#000", padding: "9px 16px",
          fontSize: 14, textAlign: "center", lineHeight: 1.4,
        }}>
          Preview for AIM review: payment types are sample data until vendors fill in the intake form
        </div>
      )}

      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header style={{
          padding: "clamp(28px, 5vw, 48px) 20px clamp(20px, 3vw, 28px)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#0d8240",
            marginBottom: 8,
          }}>
            Agricultural Institute of Marin
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(28px, 4.5vw, 40px)",
            fontWeight: 500,
            color: "#000",
            margin: "0 0 10px",
            lineHeight: 1.15,
          }}>
            {marketName ? `${marketName} Vendors` : "Market Participant Directory"}
          </h1>
          <p style={{
            margin: "0 auto",
            fontSize: 15,
            color: "#494949",
            maxWidth: 560,
            lineHeight: 1.6,
          }}>
            Find farms, food makers, and artisans at AIM farmers markets across the Bay Area.
            Filter by market or date, or search for a product.
          </p>
        </header>

        <DirectoryClient
          vendors={vendors}
          marketID={marketID ? Number(marketID) : undefined}
          marketName={marketName}
          allMarkets={MARKETS}
          payments={payments}
        />
      </div>
    </div>
  );
}

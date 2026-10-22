import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { getIntakeAnswers } from "@/lib/intakeAnswers";
import { lookupPlace } from "@/lib/placeCoords";
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
  searchParams: Promise<{ marketID?: string; embed?: string }>;
}) {
  const { marketID, embed } = await searchParams;
  // ?embed=1 is the version for the Squarespace code block (docs/squarespace-embed.html).
  const embedded = embed === "1";
  const [vendors, answers] = await Promise.all([getVendors(marketID), getIntakeAnswers()]);
  const marketName = marketID ? MARKETS[Number(marketID)] : undefined;

  // Map positions: where the vendor grows or makes products if they told us,
  // otherwise their Manage My Market city. Unmatched cities are looked up in
  // the browser.
  const coords: Record<number, [number, number]> = {};
  for (const v of vendors) {
    const hit = lookupPlace(answers.origins[v.vendorID] ?? v.city ?? "", v.state ?? "");
    if (hit) coords[v.vendorID] = hit;
  }

  // Answers from the intake Sheet. Until it's connected these are empty, and
  // the directory shows no payment, category or origin details.

  return (
    <div style={{ minHeight: embedded ? undefined : "100vh", backgroundColor: "#fff" }}>
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
            Pick a market to see its upcoming dates, or search for a product.
          </p>

          <details className="aim-about" style={{ maxWidth: 640, margin: "16px auto 0", textAlign: "left" }}>
            <summary style={{
              listStyle: "none", cursor: "pointer", textAlign: "center",
              fontSize: 14, fontWeight: 600, color: "#0d8240",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              About this directory and the information it shows
              <svg className="aim-about-chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ display: "inline-block", marginLeft: 6, verticalAlign: "-1px", transition: "transform 0.15s ease" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div style={{
              marginTop: 14, padding: "18px 22px", backgroundColor: "#f6f5ea",
              border: "1px solid #e8e7dc", fontSize: 14, lineHeight: 1.65, color: "#222",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <p style={{ margin: 0 }}>
                <strong>What&rsquo;s new.</strong>{" "}This directory replaces our previous vendor list.
                It adds each vendor&rsquo;s next market date, filters by market and date, and a map
                of where vendors are based. We&rsquo;ll also add each vendor&rsquo;s category and the
                payment types each booth accepts, such as EBT and WIC, as vendors share them with us.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Why.</strong>{" "}Shoppers and market managers asked for an easier way to plan a
                market visit and to find booths that accept their form of payment.
              </p>
              <p style={{ margin: 0 }}>
                <strong>What it shows.</strong>{" "}Business name, description, city, phone, website and
                social links, and market dates, all from each vendor&rsquo;s Manage My Market profile.
                It never shows email addresses or street addresses.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Who is included.</strong>{" "}Only market participants who have agreed in Manage
                My Market to let AIM share their information publicly. Market participants can
                change that answer, or update their details, in their Manage My Market profile at
                any time.
              </p>
            </div>
          </details>
        </header>

        <DirectoryClient
          vendors={vendors}
          marketID={marketID ? Number(marketID) : undefined}
          marketName={marketName}
          allMarkets={MARKETS}
          payments={answers.payments}
          categories={answers.categories}
          origins={answers.origins}
          coords={coords}
          embedded={embedded}
          otherPayments={answers.otherPayments}
        />
      </div>
    </div>
  );
}

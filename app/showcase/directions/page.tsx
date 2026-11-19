import type { Metadata } from "next";
import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { buildProfiles, ROSTER_2026, FOODMAKERS_CURRENT, ALUMNI, FARMER_ALUMNI, FOODMAKER_ALUMNI } from "@/lib/showcase";
import DirectionsClient from "./DirectionsClient";
import "./directions.css";

// The Program Chapters layout of the Farm & Food Program Showcase, chosen by
// AIM (Meg, 2026-11-19) out of the four directions first shown here on
// 2026-10-29. Not linked from /showcase yet, and kept out of search.
export const metadata: Metadata = {
  title: "Farm & Food Business Resources",
  metadataBase: new URL("https://aim-directory-widget.vercel.app"),
  openGraph: {
    title: "Farm & Food Business Resources",
    siteName: "Agricultural Institute of Marin",
    images: [{ url: "/og-showcase.jpg", width: 1200, height: 630, alt: "Shao Shan Farm in its flower field" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-showcase.jpg"] },
  robots: { index: false, follow: false },
};

async function getVendors(): Promise<Vendor[]> {
  try {
    const res = await fetch(
      `https://managemymarket.com/api/VendorList?orgID=${ORG_ID}`,
      {
        next: { revalidate: 3600 },
        headers: {
          "Referer": "https://www.agriculturalinstitute.org/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );
    if (!res.ok) return [];
    return parseVendorFeed(await res.text());
  } catch {
    return [];
  }
}

export default async function ShowcaseDirectionsPage() {
  const vendors = await getVendors();
  const current = buildProfiles(vendors, [...ROSTER_2026, ...FOODMAKERS_CURRENT]);
  const alumni = buildProfiles(vendors, [...ALUMNI, ...FARMER_ALUMNI, ...FOODMAKER_ALUMNI]);
  return <DirectionsClient current={current} alumni={alumni} allMarkets={MARKETS} />;
}

import type { Metadata } from "next";
import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { buildProfiles, ROSTER_2026, FOODMAKERS_CURRENT, ALUMNI, FARMER_ALUMNI, FOODMAKER_ALUMNI } from "@/lib/showcase";
import DirectionsClient from "./DirectionsClient";
import "./directions.css";

// Layout directions for the Farm & Food Program Showcase, for review with
// AIM (Meg, 2026-10-29). Not linked from /showcase, and kept out of search.
export const metadata: Metadata = {
  title: "Showcase directions — Farm & Food Business Resources",
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

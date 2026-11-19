import type { Metadata } from "next";
import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { buildProfiles, ROSTER_2026, FOODMAKERS_CURRENT, ALUMNI, FARMER_ALUMNI, FOODMAKER_ALUMNI } from "@/lib/showcase";
import ShowcaseClient from "./ShowcaseClient";
import DirectionsClient from "./directions/DirectionsClient";
import "./directions/directions.css";

export const metadata: Metadata = {
  title: "Farm & Food Business Resources — Agricultural Institute of Marin",
  description:
    "AIM's Market Access Fund, Farmer Incubator, and Food Maker Incubator programs, and the people in them.",
  metadataBase: new URL("https://aim-directory-widget.vercel.app"),
  openGraph: {
    title: "Farm & Food Business Resources",
    siteName: "Agricultural Institute of Marin",
    images: [{ url: "/og-showcase.jpg", width: 1200, height: 630, alt: "Shao Shan Farm in its flower field" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-showcase.jpg"] },
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

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;
  // ?embed=1 is the version for AIM's Squarespace code block
  // (docs/squarespace-showcase-embed.html).
  const embedded = embed === "1";
  const vendors = await getVendors();
  const profiles = buildProfiles(vendors, [...ROSTER_2026, ...FOODMAKERS_CURRENT]);
  const alumni = buildProfiles(vendors, [...ALUMNI, ...FARMER_ALUMNI, ...FOODMAKER_ALUMNI]);

  // AIM chose the Program Chapters layout (Meg, 2026-11-19); it replaces the
  // old /showcase layout. The Squarespace embed (?embed=1) keeps the old
  // layout until Program Chapters gets its own embed mode.
  if (embedded) {
    return <ShowcaseClient profiles={profiles} alumni={alumni} allMarkets={MARKETS} embedded={embedded} />;
  }
  return <DirectionsClient current={profiles} alumni={alumni} allMarkets={MARKETS} />;
}

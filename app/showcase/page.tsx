import type { Metadata } from "next";
import { Vendor, MARKETS, ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import { buildProfiles, ALUMNI } from "@/lib/showcase";
import ShowcaseClient from "./ShowcaseClient";

export const metadata: Metadata = {
  title: "Growing the Next Generation — AIM Farm & Food Business Programs",
  description:
    "The 2026 cohorts of AIM's Market Access Fund, Farmer Incubator, and Food Maker Incubator programs.",
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

export default async function ShowcasePage() {
  const vendors = await getVendors();
  const profiles = buildProfiles(vendors);
  const alumni = buildProfiles(vendors, ALUMNI);

  return <ShowcaseClient profiles={profiles} alumni={alumni} allMarkets={MARKETS} />;
}

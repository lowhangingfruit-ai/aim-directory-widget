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

    // Response is a JS file with `var mmmVendors = [...];` on one line
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
    <DirectoryClient
      vendors={vendors}
      marketID={marketID ? Number(marketID) : undefined}
      marketName={marketName}
      allMarkets={MARKETS}
    />
  );
}

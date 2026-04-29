import { NextRequest, NextResponse } from "next/server";
import { ORG_ID } from "@/lib/types";

export async function GET(request: NextRequest) {
  const marketID = request.nextUrl.searchParams.get("marketID");

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

    if (!res.ok) return NextResponse.json([], { status: 502 });

    const text = await res.text();
    const match = text.match(/var mmmVendors = (\[[\s\S]*?\]);/);
    if (!match) return NextResponse.json([]);

    const data = JSON.parse(match[1]);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json([]);
  }
}

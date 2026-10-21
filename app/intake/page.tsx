import type { Metadata } from "next";
import { ORG_ID } from "@/lib/types";
import { parseVendorFeed } from "@/lib/vendors";
import type { IntakeVendorOption } from "@/lib/intake";
import IntakeForm from "./IntakeForm";

export const metadata: Metadata = {
  title: "Market Directory Details | Agricultural Institute of Marin",
  description: "Tell shoppers how they can pay at your booth. Takes about two minutes.",
};

// Only businesses that allow sharing in MMM are listed, since only they appear
// in the directory. Names and cities come from the same public feed.
async function getVendorOptions(): Promise<IntakeVendorOption[]> {
  try {
    const res = await fetch(`https://managemymarket.com/api/VendorList?orgID=${ORG_ID}`, {
      next: { revalidate: 3600 },
      headers: {
        "Referer": "https://www.agriculturalinstitute.org/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return [];
    return parseVendorFeed(await res.text())
      .map((v) => ({ vendorID: v.vendorID, company: v.company.trim(), city: v.city?.trim() ?? "" }))
      .sort((a, b) => a.company.localeCompare(b.company));
  } catch {
    return [];
  }
}

export default async function IntakePage() {
  const vendors = await getVendorOptions();
  return <IntakeForm vendors={vendors} />;
}

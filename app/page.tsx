import { fetchVendors } from "@/lib/vendors";
import { getIntakeAnswers } from "@/lib/intakeAnswers";
import { lookupPlace } from "@/lib/placeCoords";
import { MARKET_BY_ID } from "@/lib/markets";
import { getAttendanceHistory } from "@/lib/attendance";
import { catalogFor } from "@/lib/catalog";
import DirectoryApp from "./directory/DirectoryApp";
import { todayIso } from "./directory/vendorUtils";

// The full feed every time: a market page also shows each vendor's other markets.
// If it can't be read the page still renders, with no participants.
async function getVendors() {
  try {
    return await fetchVendors();
  } catch (err) {
    console.error(`[directory] feed read failed: ${err instanceof Error ? err.message : "unknown error"}`);
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
  const today = todayIso();
  const [vendors, answers] = await Promise.all([getVendors(), getIntakeAnswers()]);
  const history = await getAttendanceHistory(today, new Set(vendors.map((v) => v.vendorID)));
  // Categories and products come from AIM's Manage My Market reports; a
  // vendor's own answer in the intake Sheet wins where there is one.
  const mmm = catalogFor(vendors.map((v) => v.vendorID));
  const categories = { ...mmm.categories, ...answers.categories };
  const initialMarket = marketID && MARKET_BY_ID[Number(marketID)] ? Number(marketID) : undefined;

  // Map positions and distances: where the vendor grows or makes products if
  // they told us, otherwise their Manage My Market city. Unmatched cities are
  // looked up in the browser for the map.
  const coords: Record<number, [number, number]> = {};
  for (const v of vendors) {
    const hit = lookupPlace(answers.origins[v.vendorID] ?? v.city ?? "", v.state ?? "");
    if (hit) coords[v.vendorID] = hit;
  }

  return (
    <DirectoryApp
      vendors={vendors}
      initialMarket={initialMarket}
      today={today}
      history={history}
      payments={answers.payments}
      categories={categories}
      catalog={mmm.catalog}
      origins={answers.origins}
      otherPayments={answers.otherPayments}
      coords={coords}
      embedded={embedded}
    />
  );
}

import { revalidateTag } from "next/cache";
import { fetchVendors } from "@/lib/vendors";
import { ATTENDANCE_TAG, saveAttendance } from "@/lib/attendance";
import { todayIso } from "@/app/directory/vendorUtils";

// Daily job (vercel.json, 5am Pacific): saves every upcoming market day's
// participant list, so the directory can show the past month once MMM drops
// those dates.
//
// When a step fails: if the feed can't be read or comes back empty, nothing is
// written and the stored history stays as it was. If storage can't be read,
// nothing is written either, so a partial file never replaces a full one. A
// missed day loses nothing, because the previous run already saved that date.
// Running it twice gives the same file.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    const vendors = await fetchVendors({ fresh: true });
    if (!vendors.length) {
      console.error("[attendance] feed came back empty; nothing saved");
      return Response.json({ ok: false, error: "Feed was empty" }, { status: 502 });
    }
    const saved = await saveAttendance(vendors, todayIso());
    revalidateTag(ATTENDANCE_TAG, "max");
    console.log(`[attendance] saved ${saved.dates} market days across ${saved.markets} markets`);
    return Response.json({ ok: true, ...saved });
  } catch (err) {
    console.error(`[attendance] run failed: ${err instanceof Error ? err.message : "unknown error"}`);
    return Response.json({ ok: false, error: "Run failed" }, { status: 500 });
  }
}

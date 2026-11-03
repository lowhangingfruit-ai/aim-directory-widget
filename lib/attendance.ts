import { get, put } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import type { Vendor } from "./types";
import { MARKET_BY_ID } from "./markets";

// Manage My Market only lists upcoming market dates, so the directory keeps
// its own record of who was listed for each day. A daily job
// (app/api/cron/attendance) saves every upcoming date's list; once a date
// passes, the last list saved before it is the one kept.
//
// Stored as one private JSON file in Vercel Blob: market ID -> ISO date ->
// vendor IDs. Only IDs and dates, which are public in the feed anyway.

export type AttendanceHistory = Record<number, Record<string, number[]>>;

const PATH = "attendance/history.json";
const KEEP_DAYS = 45; // the page shows 31; a little extra covers a missed run
export const ATTENDANCE_TAG = "attendance";

const isoFromFeed = (s: string) => {
  const [m, d, y] = s.split("/").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

function isoDaysBefore(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - n));
  return t.toISOString().slice(0, 10);
}

const enabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function readStored(): Promise<AttendanceHistory> {
  const res = await get(PATH, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return {};
  return JSON.parse(await new Response(res.stream).text()) as AttendanceHistory;
}

// Upcoming dates in today's feed, per market, as vendor ID lists.
export function snapshotFromFeed(vendors: Vendor[], today: string): AttendanceHistory {
  const out: AttendanceHistory = {};
  for (const v of vendors) {
    for (const m of v.markets) {
      if (!MARKET_BY_ID[m.marketID]) continue;
      for (const d of m.dates ?? []) {
        const iso = isoFromFeed(d);
        if (iso < today) continue;
        ((out[m.marketID] ??= {})[iso] ??= []).push(v.vendorID);
      }
    }
  }
  return out;
}

// Upcoming dates take the newest list; past dates are never changed; anything
// older than KEEP_DAYS is dropped. Running it twice gives the same result.
export function mergeHistory(stored: AttendanceHistory, snapshot: AttendanceHistory, today: string): AttendanceHistory {
  const oldest = isoDaysBefore(today, KEEP_DAYS);
  const out: AttendanceHistory = {};
  for (const [market, days] of Object.entries(stored)) {
    for (const [iso, ids] of Object.entries(days)) {
      if (iso >= oldest && iso < today) (out[Number(market)] ??= {})[iso] = ids;
    }
  }
  for (const [market, days] of Object.entries(snapshot)) {
    for (const [iso, ids] of Object.entries(days)) (out[Number(market)] ??= {})[iso] = [...new Set(ids)].sort((a, b) => a - b);
  }
  return out;
}

// Called by the daily job. Throws if anything fails, so nothing partial is written.
export async function saveAttendance(vendors: Vendor[], today: string): Promise<{ markets: number; dates: number }> {
  if (!enabled()) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  const snapshot = snapshotFromFeed(vendors, today);
  const merged = mergeHistory(await readStored(), snapshot, today);
  await put(PATH, JSON.stringify(merged), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return {
    markets: Object.keys(merged).length,
    dates: Object.values(merged).reduce((n, days) => n + Object.keys(days).length, 0),
  };
}

const cachedRead = unstable_cache(readStored, ["attendance-history-v1"], { revalidate: 3600, tags: [ATTENDANCE_TAG] });

// Past dates for the page: the last 31 days, before today. IDs are matched
// against today's feed, so anyone who has withdrawn sharing permission drops
// out of past dates too. Without storage, or if the read fails, the page still
// loads, just without past dates.
export async function getAttendanceHistory(today: string, permitted: Set<number>): Promise<AttendanceHistory> {
  if (!enabled()) return {};
  try {
    const stored = await cachedRead();
    const since = isoDaysBefore(today, 31);
    const out: AttendanceHistory = {};
    for (const [market, days] of Object.entries(stored)) {
      for (const [iso, ids] of Object.entries(days)) {
        if (iso < since || iso >= today) continue;
        (out[Number(market)] ??= {})[iso] = ids.filter((id) => permitted.has(id));
      }
    }
    return out;
  } catch (err) {
    console.error(`[attendance] read failed: ${err instanceof Error ? err.message : "unknown error"}`);
    return {};
  }
}

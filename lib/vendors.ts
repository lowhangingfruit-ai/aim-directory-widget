import { readFile } from "node:fs/promises";
import { ORG_ID, Vendor } from "./types";

const FEED_REGEX = /var mmmVendors = (\[[\s\S]*?\]);/;

// Some vendor text in MMM was saved double-encoded: UTF-8 bytes read as
// Windows-1252, so "Meera’s" arrives as "Meeraâ€™s" and "é" as "Ã©". Each
// run of those characters is turned back into bytes and decoded as UTF-8,
// up to twice for text that went through the mix-up more than once. A run
// that doesn't decode cleanly is left exactly as it was.
const CP1252: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};
const MOJIBAKE = /[\u00c2-\u00f4][\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018-\u201e\u2020-\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]+/g;
const utf8 = new TextDecoder("utf-8", { fatal: true });

function undoRun(run: string): string {
  const bytes: number[] = [];
  for (const ch of run) {
    const code = ch.codePointAt(0)!;
    const b = code < 0x100 ? code : CP1252[code];
    if (b === undefined) return run;
    bytes.push(b);
  }
  try {
    return utf8.decode(new Uint8Array(bytes));
  } catch {
    return run;
  }
}

export function fixMojibake(s: unknown): unknown {
  if (typeof s !== "string") return s;
  let out = s;
  for (let i = 0; i < 2; i++) {
    const next = out.replace(MOJIBAKE, undoRun);
    if (next === out) break;
    out = next;
  }
  return out;
}

// Parses the MMM feed, drops vendors without the sharing-permission flag,
// and whitelists fields so email and street address never leave the server.
export function parseVendorFeed(text: string): Vendor[] {
  const match = text.match(FEED_REGEX);
  if (!match) return [];

  let raw: Record<string, unknown>[];
  try {
    raw = JSON.parse(match[1]);
  } catch {
    return [];
  }

  return raw
    .filter((v) => v.permission === true)
    .map((v) => ({
      vendorID: v.vendorID,
      company: fixMojibake(v.company),
      type: v.type,
      phone1: v.phone1,
      city: fixMojibake(v.city),
      state: v.state,
      description: fixMojibake(v.description),
      website: v.website,
      photo: v.photo,
      twitter_handle: v.twitter_handle,
      facebook_profile: v.facebook_profile,
      instagram_profile: v.instagram_profile,
      permission: v.permission,
      markets: v.markets,
    })) as Vendor[];
}

// The full feed for AIM's org. Pages use the hourly cached copy; the attendance
// job asks for a fresh one. MMM_FEED_FILE points at a saved copy of the feed
// for end-to-end tests. Throws if the feed can't be read, so callers decide
// whether an empty list is acceptable.
export async function fetchVendors({ fresh = false } = {}): Promise<Vendor[]> {
  if (process.env.MMM_FEED_FILE) return parseVendorFeed(await readFile(process.env.MMM_FEED_FILE, "utf8"));
  const res = await fetch(`https://managemymarket.com/api/VendorList?orgID=${ORG_ID}`, {
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 3600 } }),
    headers: {
      "Referer": "https://www.agriculturalinstitute.org/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`feed responded ${res.status}`);
  return parseVendorFeed(await res.text());
}

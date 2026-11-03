import { readFile } from "node:fs/promises";
import { ORG_ID, Vendor } from "./types";

const FEED_REGEX = /var mmmVendors = (\[[\s\S]*?\]);/;

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
      company: v.company,
      type: v.type,
      phone1: v.phone1,
      city: v.city,
      state: v.state,
      description: v.description,
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

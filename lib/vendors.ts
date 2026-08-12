import { Vendor } from "./types";

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

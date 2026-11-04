import RAW from "./websitePhotos.json";
import type { Vendor, WebsitePhoto } from "./types";

// A picture from the vendor's own website, for vendors who haven't uploaded
// one to Manage My Market. Built by scripts/fetch-website-photos.mjs, which
// saves each image to public/website-photos/. Server-side only: the page adds
// the small part the directory needs to each vendor it sends.

type RawEntry = WebsitePhoto & { siteUrl: string; originalUrl: string; width: number; height: number; fetchedAt: string };
const DATA = RAW as unknown as Record<string, RawEntry>;

// Same test the directory uses to decide an MMM upload can be shown (some are PDFs or EPS files).
export const IMAGE_FILE = /\.(jpe?g|png|gif|webp)$/i;

export function hasMmmPhoto(v: Pick<Vendor, "photo">): boolean {
  return IMAGE_FILE.test((v.photo ?? "").trim());
}

// The MMM photo always wins, so a vendor who uploads one replaces the website image.
export function withWebsitePhotos(vendors: Vendor[]): Vendor[] {
  return vendors.map((v) => {
    const e = DATA[v.vendorID];
    if (!e || hasMmmPhoto(v)) return v;
    return { ...v, sitePhoto: { url: e.url, source: e.source, fit: e.fit, background: e.background } };
  });
}

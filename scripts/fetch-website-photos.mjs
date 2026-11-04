// Fills in a picture for vendors who haven't uploaded one to Manage My Market
// but list a website there. For each one it reads the site's home page and
// takes, in order: the share image (og:image, then twitter:image), or a logo
// (apple-touch-icon, a large icon, or an <img> with "logo" in it). Each pick is
// downloaded, checked, resized and saved to public/website-photos/<vendorID>.webp,
// so the directory never hotlinks a vendor's site. lib/websitePhotos.json maps
// vendor ID to the saved file.
//
// Skipped: tiny icons (under 120px), images that look like a placeholder or
// stock photo, images several unrelated sites share (a site builder's default),
// nearly blank images, parked domains, and sites that don't answer.
//
// Run: node scripts/fetch-website-photos.mjs
//   --keep          keep vendors already in lib/websitePhotos.json, fetch only new ones
//   --only=1,2,3    fetch just these vendor IDs (others are kept as they are)
//   MMM_FEED_FILE=path  read a saved copy of the feed instead of Manage My Market
// Check the printed list of skipped sites, look over the new images, and commit
// lib/websitePhotos.json with public/website-photos/.

import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = path.join(ROOT, "lib", "websitePhotos.json");
const OUT_DIR = path.join(ROOT, "public", "website-photos");
const FEED = "https://managemymarket.com/api/VendorList?orgID=913";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const IMAGE_FILE = /\.(jpe?g|png|gif|webp)$/i; // same test the directory uses for MMM uploads
const MIN_SIDE = 120;
const CONCURRENCY = 8;

const args = process.argv.slice(2);
const keep = args.includes("--keep");
const only = new Set((args.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean).map(Number));

// Website fields that point at a profile on another platform, not the vendor's own site.
const NOT_OWN_SITE = /(^|\.)(instagram|facebook|fb|linktr|linkin\.bio|tiktok|twitter|x|yelp|etsy|google|goo\.gl|youtube)\.(com|ee|me|gl|bio)$/i;
// Image URLs that are placeholders, stock photos or a platform's own artwork.
const PLACEHOLDER = /placeholder|no[-_]?image|default[-_]?(image|og|share|social)|coming[-_]?soon|blank\.(png|gif|jpg)|spacer|pixel\.gif|\/isteam\/stock\/|unsplash|shutterstock|istockphoto|gettyimages|pexels|pixabay|depositphotos|dreamstime|adobestock|stock[-_]?photo|wix-logo|squarespace-logo|godaddy|weebly-logo|shopify-logo|gravatar/i;
// Images that belong to someone else: certifier and market logos, payment and
// review badges, press mentions, and screenshots.
const THIRD_PARTY = /ccof|usda|organic[-_+ ]?(seal|logo|cert)|certified[-_+ ]?naturally|edible|temescal|farmers?[-_+ ]?market|screen[-_ ]?shot|visa|mastercard|paypal|payment|badge|award|\bseal\b|\bbbb\b|yelp|tripadvisor|featured[-_ ]?in|as[-_ ]?seen/i;
// Picks that passed the checks but were wrong on review (Nov 2026). Re-check
// these by hand if a vendor's site changes.
const EXCLUDE = {
  340289: "site now shows unrelated content",
  336403: "share image is a strip of checkout badges",
  336501: "image is a beekeeping program's logo, not the vendor's",
  336128: "only a cropped favicon of the wordmark",
  201036: "logos on the page are certifiers' (CCOF, Bee Friendly)",
  336463: "logos on the page are the markets' they play",
  379243: "logos on the page are certifiers' and partners'",
  77483: "blurry, upscaled small icon",
  301920: "faint, low-res logo",
  365885: "faint logo, hard to read on the tile",
  253008: "text banner rather than a photo or logo",
};
const PARKED = /domain (name )?(is|may be) for sale|buy this domain|this domain (has expired|is parked)|parked (free|domain)|hugedomains|sedoparking|dan\.com|afternic|domain has expired|website is coming soon|future home of/i;

function cleanUrl(raw) {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const at = s.lastIndexOf("http");
  return at >= 0 ? s.slice(at) : `https://${s}`;
}

async function readFeed() {
  const text = process.env.MMM_FEED_FILE
    ? await readFile(process.env.MMM_FEED_FILE, "utf8")
    : await (await fetch(FEED, { headers: { Referer: "https://www.agriculturalinstitute.org/", "User-Agent": UA }, signal: AbortSignal.timeout(30000) })).text();
  const m = text.match(/var mmmVendors = (\[[\s\S]*?\]);/);
  if (!m) throw new Error("couldn't find the vendor list in the feed");
  return JSON.parse(m[1]).filter((v) => v.permission === true);
}

async function get(url, accept) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

// Attributes of every <tag ...> in the page, lower-cased names.
function tags(html, name) {
  const out = [];
  const re = new RegExp(`<${name}\\b([^>]*)>`, "gi");
  for (const m of html.matchAll(re)) {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
      attrs[a[1].toLowerCase()] = (a[3] ?? a[4] ?? a[5] ?? "").replace(/&amp;/g, "&").trim();
    }
    out.push(attrs);
  }
  return out;
}

function candidates(html, base) {
  const abs = (u) => { try { return u && !u.startsWith("data:") ? new URL(u, base).href : null; } catch { return null; } };
  const metas = tags(html, "meta");
  const meta = (key) => metas.filter((m) => [m.property, m.name].some((k) => k?.toLowerCase() === key)).map((m) => abs(m.content));
  const og = [...meta("og:image:secure_url"), ...meta("og:image"), ...meta("og:image:url"), ...meta("twitter:image"), ...meta("twitter:image:src")];

  const links = tags(html, "link");
  const size = (l) => Math.max(0, ...(l.sizes ?? "").split(/\s+/).map((s) => Number(s.split("x")[0]) || 0));
  const touch = links.filter((l) => /apple-touch-icon/i.test(l.rel ?? "")).sort((a, b) => size(b) - size(a)).map((l) => abs(l.href));
  const icons = links.filter((l) => /(^|\s)icon(\s|$)/i.test(l.rel ?? "") && (size(l) >= MIN_SIDE || /\.svg/i.test(l.href ?? ""))).sort((a, b) => size(b) - size(a)).map((l) => abs(l.href));
  const imgs = tags(html, "img")
    .filter((i) => /logo/i.test([i.src, i["data-src"], i.class, i.id, i.alt].join(" ")))
    .map((i) => abs(i["data-src"] || i.src || (i.srcset ?? "").split(",").pop()?.trim().split(/\s+/)[0]));
  // Logos in the page itself usually beat the touch icon (often a cropped square).
  const logo = [...imgs, ...touch, ...icons];
  const uniq = (list) => [...new Set(list.filter(Boolean))];
  return [...uniq(og).map((url) => ({ url, source: "og" })), ...uniq(logo).map((url) => ({ url, source: "logo" }))];
}

// Downloads one image and decides whether it's usable. Returns the processed
// webp and how the directory should fit it, or a reason it was skipped.
async function processImage(c) {
  if (PLACEHOLDER.test(c.url)) return { skip: "placeholder URL" };
  if (THIRD_PARTY.test(decodeURIComponent(c.url))) return { skip: "someone else's logo, a badge or a screenshot" };
  const res = await get(c.url, "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8");
  const type = res.headers.get("content-type") ?? "";
  if (!/image|octet-stream|svg/i.test(type)) return { skip: `not an image (${type.split(";")[0]})` };
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 600) return { skip: "image too small" };
  const head = buf.subarray(0, 300).toString("utf8").trimStart();
  const svg = /svg/i.test(type) || /\.svg(\?|$)/i.test(c.url) || /^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)?<svg\b/i.test(head);
  if (buf.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]))) return { skip: "favicon (.ico)" };
  let img = sharp(buf, { density: svg ? 300 : 72, animated: false, failOn: "none" });
  const meta = await img.metadata();
  if (!meta.width || !meta.height) return { skip: "unreadable image" };
  // Square icons under 120px are favicons. A wide logo (a wordmark) can be
  // shorter than that and still read well when shown whole.
  const wideLogo = c.source === "logo" && Math.max(meta.width, meta.height) >= 240 && Math.min(meta.width, meta.height) >= 40;
  if (!svg && Math.min(meta.width, meta.height) < MIN_SIDE && !wideLogo) return { skip: `tiny (${meta.width}x${meta.height})` };
  const stats = await sharp(buf, { density: svg ? 300 : 72, failOn: "none" }).stats();
  const spread = stats.channels.slice(0, 3).reduce((s, ch) => s + ch.stdev, 0) / 3;
  const alpha = meta.hasAlpha && stats.channels[3] && stats.channels[3].mean < 250;
  if (spread < 4 && !alpha) return { skip: "nearly blank" };
  // A share image that is really a logo (transparent, or small and squarish)
  // is shown whole like a logo rather than cropped.
  const squarish = meta.width / meta.height > 0.75 && meta.width / meta.height < 1.34;
  const fit = c.source === "logo" || alpha || (squarish && meta.width < 500) ? "contain" : "cover";
  // A light logo on a transparent background would vanish on the white tile,
  // so it gets a dark one.
  let background = "light";
  if (fit === "contain" && alpha) {
    const { data } = await sharp(buf, { density: svg ? 300 : 72, failOn: "none" }).ensureAlpha().resize(64, 64, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
    let opaque = 0, darkish = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      opaque++;
      if (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2] < 170) darkish++;
    }
    if (opaque && darkish / opaque < 0.04) background = "dark";
  }
  const max = fit === "cover" ? 1080 : 600;
  img = img.rotate().resize({ width: max, height: max, fit: "inside", withoutEnlargement: !svg });
  const out = await img.webp({ quality: 80, alphaQuality: 90 }).toBuffer({ resolveWithObject: true });
  return { buf: out.data, width: out.info.width, height: out.info.height, fit, background, hash: createHash("sha1").update(buf).digest("hex") };
}

async function forVendor(v) {
  const siteUrl = cleanUrl(v.website);
  let host;
  try { host = new URL(siteUrl).hostname.replace(/^www\./, ""); } catch { return { skip: "website isn't a valid address" }; }
  if (!host.includes(".")) return { skip: "website isn't a valid address" };
  if (NOT_OWN_SITE.test(host)) return { skip: `website is a ${host} profile` };
  if (EXCLUDE[v.vendorID]) return { skip: `excluded on review: ${EXCLUDE[v.vendorID]}` };
  // MMM adds "www." to every website, which some sites don't answer on.
  let html, finalUrl, error;
  const tries = [siteUrl, siteUrl.replace("://www.", "://")];
  for (const url of [...new Set(tries)]) {
    try {
      const res = await get(url, "text/html,application/xhtml+xml");
      finalUrl = res.url || url;
      html = (await res.text()).slice(0, 600_000);
      break;
    } catch (err) {
      error ??= err;
    }
  }
  if (!html) return { skip: `site didn't load (${error.cause?.code ?? error.message})` };
  if (PARKED.test(html.slice(0, 60_000)) && html.length < 60_000) return { skip: "parked or placeholder domain" };
  const list = candidates(html, finalUrl);
  if (!list.length) return { skip: "no share image or logo on the home page" };
  const reasons = [];
  for (const c of list.slice(0, 6)) {
    try {
      const r = await processImage(c);
      if (r.skip) { reasons.push(`${c.source}: ${r.skip}`); continue; }
      return { ...r, ...c, siteUrl: finalUrl };
    } catch (err) {
      reasons.push(`${c.source}: ${err.cause?.code ?? err.message}`);
    }
  }
  return { skip: reasons.join("; ") };
}

async function pool(items, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i]); }
  }));
  return results;
}

const vendors = await readFeed();
const missing = vendors.filter((v) => !IMAGE_FILE.test((v.photo ?? "").trim()));
const withSite = missing.filter((v) => (v.website ?? "").trim());
let existing = {};
try { existing = JSON.parse(await readFile(OUT_JSON, "utf8")); } catch { /* first run */ }

const todo = withSite.filter((v) => (only.size ? only.has(v.vendorID) : !(keep && existing[v.vendorID])));
console.log(`${vendors.length} listed vendors, ${missing.length} without an MMM photo, ${withSite.length} of them with a website; fetching ${todo.length}.`);
const results = await pool(todo, forVendor);

// An image shared by sites on different domains is a site builder's default.
const byHash = new Map();
results.forEach((r, i) => { if (r.hash) byHash.set(r.hash, [...(byHash.get(r.hash) ?? []), i]); });
for (const idxs of byHash.values()) {
  const hosts = new Set(idxs.map((i) => new URL(results[i].siteUrl).hostname.replace(/^www\./, "")));
  if (hosts.size > 1) for (const i of idxs) results[i] = { skip: "same image as other vendors' sites (a builder default)" };
}

await mkdir(OUT_DIR, { recursive: true });
const keepIds = new Set(withSite.map((v) => v.vendorID));
const out = {};
// Carry over entries this run didn't fetch, for vendors who still need them.
for (const [id, e] of Object.entries(existing)) if (keepIds.has(Number(id)) && !todo.some((v) => v.vendorID === Number(id))) out[id] = e;
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const fetchedAt = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`;
const skipped = [];
for (const [i, v] of todo.entries()) {
  const r = results[i];
  if (r.skip) { skipped.push(`${v.vendorID} ${v.company} (${v.website.trim()}): ${r.skip}`); continue; }
  await writeFile(path.join(OUT_DIR, `${v.vendorID}.webp`), r.buf);
  out[v.vendorID] = { url: `/website-photos/${v.vendorID}.webp`, source: r.source, fit: r.fit, background: r.background, width: r.width, height: r.height, siteUrl: r.siteUrl, originalUrl: r.url, fetchedAt };
}
// Remove files for vendors no longer in the list (they uploaded a photo, or left).
for (const f of await readdir(OUT_DIR)) if (!out[f.replace(/\.webp$/, "")]) await unlink(path.join(OUT_DIR, f));

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => Number(a) - Number(b)));
await writeFile(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");

const counts = Object.values(sorted).reduce((c, e) => ({ ...c, [e.source]: (c[e.source] ?? 0) + 1 }), {});
console.log(`\nSaved ${Object.keys(sorted).length} website images (share image: ${counts.og ?? 0}, logo: ${counts.logo ?? 0}).`);
console.log(`${missing.length - Object.keys(sorted).length} vendors still have no picture (${missing.length - withSite.length} list no website).`);
if (skipped.length) console.log(`\nSkipped ${skipped.length}:\n  ${skipped.join("\n  ")}`);

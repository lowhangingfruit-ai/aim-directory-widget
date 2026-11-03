import type { Vendor } from "@/lib/types";
import { MARKET_BY_ID } from "@/lib/markets";

// MMM dates arrive as M/D/YYYY. Inside the directory they're ISO (YYYY-MM-DD),
// which sorts as text and doubles as a stable key.
export function isoFromFeed(s: string): string {
  const [m, d, y] = s.split("/").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function dateFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Market days are in California, so "today" is the Pacific date on the server
// and in every visitor's browser alike.
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export const shortDate = (iso: string) =>
  dateFromIso(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const longDate = (iso: string) =>
  dateFromIso(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const LEGAL_SUFFIXES = /[\s,]+(LLC|Inc\.?|Corp\.?|Co\.?|Ltd\.?|L\.L\.C\.?)$/i;
export function displayName(company: string): string {
  return company.replace(LEGAL_SUFFIXES, "").trim();
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCity(city: string, state: string): string {
  const c = titleCase((city ?? "").trim());
  const st = (state ?? "").trim();
  if (!c) return "";
  return /^[A-Z]{2}$/.test(st) ? `${c}, ${st}` : c;
}

export function initials(name: string): string {
  return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// Some MMM profiles paste a full URL into a handle field, so keep the last URL.
export function cleanUrl(raw: string | undefined): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const at = s.lastIndexOf("http");
  if (at >= 0) return s.slice(at);
  return `https://${s}`;
}

// Dates a vendor is listed for at one market (or any market), ISO, sorted.
export function vendorDates(v: Vendor, marketID?: number): string[] {
  return v.markets
    .filter((m) => MARKET_BY_ID[m.marketID] && (!marketID || m.marketID === marketID))
    .flatMap((m) => (m.dates ?? []).map(isoFromFeed))
    .sort();
}

export function nextDate(v: Vendor, today: string, marketID?: number): { iso: string; marketID: number } | null {
  let best: { iso: string; marketID: number } | null = null;
  for (const m of v.markets) {
    if (!MARKET_BY_ID[m.marketID] || (marketID && m.marketID !== marketID)) continue;
    for (const d of m.dates ?? []) {
      const iso = isoFromFeed(d);
      if (iso >= today && (!best || iso < best.iso)) best = { iso, marketID: m.marketID };
    }
  }
  return best;
}

// Search covers the business name, description, city, category labels and
// products (extraText), and the days the vendor is at market ("sunday" finds
// Sunday sellers).
export function matchesSearch(v: Vendor, q: string, extraText: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const days = v.markets.map((m) => MARKET_BY_ID[m.marketID]?.day ?? "").join(" ");
  return [v.company, v.description ?? "", v.city ?? "", extraText, days].some((s) => s.toLowerCase().includes(query));
}

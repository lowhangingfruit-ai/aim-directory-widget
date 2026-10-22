import PLACES from "./placeCoords.json";

// City coordinates for the directory map, from the US Census Gazetteer
// (public domain, California places; regenerate with
// scripts/build-place-coords.py). Server-side only, so the table stays out of
// the page bundle. Anything it can't match is looked up in the browser.

const TABLE = PLACES as unknown as Record<string, [number, number]>;

// Common ways vendors type a city in Manage My Market.
const ALIASES: Record<string, string> = {
  sf: "san francisco",
  "s.f.": "san francisco",
  "saint helena": "st. helena",
};

export function cityKey(city: string, state: string): string {
  let name = city.toLowerCase().replace(/\s+/g, " ").trim();
  name = name.replace(/,?\s+(ca|calif\.?|california)$/, "").trim(); // "Oakland CA"
  name = ALIASES[name] ?? name;
  const st = /^[A-Z]{2}$/.test(state.trim()) ? state.trim() : "CA";
  return `${name}|${st}`;
}

export function lookupPlace(city: string, state: string): [number, number] | null {
  if (!city.trim()) return null;
  return TABLE[cityKey(city, state)] ?? null;
}

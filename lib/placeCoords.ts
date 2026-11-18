import PLACES from "./placeCoords.json";
import FIXES from "./placeCoordsFixes.json";

// City coordinates for the directory map, from the US Census Gazetteer
// (public domain, California places; regenerate with
// scripts/build-place-coords.py). Server-side only, so the table stays out of
// the page bundle. Anything it can't match is looked up in the browser.
//
// A Census point sits inside the place's legal boundary, which for a few
// places reaches out to sea: San Francisco's takes in the Farallon Islands, so
// its point is 25 miles offshore. lib/placeCoordsFixes.json moves those back
// to the city (San Francisco to City Hall). scripts/check-map-pins.py finds
// them: run it after regenerating the table or when a pin looks wrong.
const TABLE = { ...PLACES, ...FIXES } as unknown as Record<string, [number, number]>;

// Common ways vendors type a city in Manage My Market.
const ALIASES: Record<string, string> = {
  sf: "san francisco",
  "s.f.": "san francisco",
  "saint helena": "st. helena",
  // Typos in Manage My Market cities (Nov 2026), so they match the table
  // instead of going to the geocoder.
  watsonvill: "watsonville",
  "martinez l": "martinez",
  gratonr: "graton",
  "san juan batista": "san juan bautista",
  murietta: "murrieta",
  "san ansemo": "san anselmo",
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

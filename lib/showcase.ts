import { Vendor } from "./types";

// 2026 cohort roster. Names and program membership are public on AIM's
// program pages (farmers-market-incubator-booth, market-access-fund).
// Profile detail is joined at request time from the permission-filtered
// MMM feed, so vendors who declined sharing never gain data here.

export type ProgramID = "farmer" | "foodmaker" | "maf";

export interface Program {
  id: ProgramID;
  name: string;
  shortName: string;
  color: string;
  tint: string;
  blurb: string;
  url: string;
}

export const PROGRAMS: Record<ProgramID, Program> = {
  maf: {
    id: "maf",
    name: "Market Access Fund",
    shortName: "Market Access Fund",
    color: "#b13328",
    tint: "#f6e3e0",
    blurb:
      "Grants that reduce financial barriers for BIPOC farmers, food producers, and artisans in their first five years at AIM markets.",
    url: "https://www.agriculturalinstitute.org/market-access-fund",
  },
  farmer: {
    id: "farmer",
    name: "Farmer Incubator Booth",
    shortName: "Farmer Incubator",
    color: "#0d8240",
    tint: "#e2efe4",
    blurb:
      "A year of free market access for beginning farmers, run with Kitchen Table Advisors and ALBA. Cohorts rotate through Clement St., Hayward, and Grand Lake.",
    url: "https://www.agriculturalinstitute.org/farmers-market-incubator-booth",
  },
  foodmaker: {
    id: "foodmaker",
    name: "Food Maker Incubator Booth",
    shortName: "Food Maker Incubator",
    color: "#a9821a",
    tint: "#f4edd8",
    blurb:
      "Waived fees, a stipend, and business training for emerging Marin food entrepreneurs, funded by Marin County Parks' Measure A FARE grant.",
    url: "https://www.agriculturalinstitute.org/food-maker-incubator-booth",
  },
};

export interface RosterEntry {
  person: string;
  business: string;
  program: ProgramID;
  // Case-insensitive substring matched against the feed's company field.
  match: string;
}

export const ROSTER_2026: RosterEntry[] = [
  // Market Access Fund, 2026 cohort
  { person: "Alicia Waters", business: "MalDoni's", program: "maf", match: "maldoni" },
  { person: "Carlos Salgado", business: "Salviricans", program: "maf", match: "salvirican" },
  { person: "Chen Huang", business: "Luna's Good Cat and Dog Treats", program: "maf", match: "luna's good" },
  { person: "Dalene Dematteis", business: "Dangerously Delicious Desserts", program: "maf", match: "dangerously delicious" },
  { person: "James Hong", business: "Lion Kings", program: "maf", match: "lion kings" },
  { person: "Minyi Liu", business: "Yi Lemon & Yi Mian", program: "maf", match: "yi lemon" },
  { person: "Maria Zavala", business: "Blooming Maria's Flower Farm", program: "maf", match: "blooming maria" },
  { person: "Nirali Maru", business: "Leafy Veda", program: "maf", match: "leafy veda" },
  { person: "Sayaka Tani", business: "Nobunaga's Blue Ribbon", program: "maf", match: "nobunaga" },
  { person: "Vineeta Chand", business: "Snoring Orange Studio", program: "maf", match: "snoring orange" },
  // Farmer Incubator Booth, 2026 cohort
  { person: "Antonia Vega Gonzalez", business: "Dulce Organic Farms", program: "farmer", match: "dulce organic" },
  { person: "Maria Magdalena Lopez Poiras", business: "Tierra de Esperanza", program: "farmer", match: "tierra de esperanza" },
  { person: "Luis A Cervantes Mendoza", business: "Monarca Berry Farm", program: "farmer", match: "monarca" },
  { person: "Salvador Ruiz", business: "Products from Paradise", program: "farmer", match: "products from paradise" },
  { person: "Martin Avina Hernandez", business: "Avina Organic Farm", program: "farmer", match: "avina" },
  { person: "Eduardo Medrano", business: "E&N Organic Farm", program: "farmer", match: "e&n organic" },
];

export interface Profile extends RosterEntry {
  vendor: Vendor | null;
}

export function buildProfiles(vendors: Vendor[]): Profile[] {
  return ROSTER_2026.map((entry) => ({
    ...entry,
    vendor:
      vendors.find((v) =>
        v.company.toLowerCase().includes(entry.match.toLowerCase())
      ) ?? null,
  }));
}

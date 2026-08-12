import { Vendor } from "./types";

// 2026 cohort roster. Names, program membership, and MAF portraits are public
// on AIM's program pages (farmers-market-incubator-booth, market-access-fund).
// Profile detail is joined at request time from the permission-filtered
// MMM feed, so vendors who declined sharing never gain data here.

export type ProgramID = "farmer" | "foodmaker" | "maf";

export interface Program {
  id: ProgramID;
  name: string;
  shortName: string;
  color: string; // AIM palette: deep green, bright green, orange
  textOnColor: string;
  tint: string;
  blurb: string;
  url: string;
}

export const PROGRAMS: Record<ProgramID, Program> = {
  maf: {
    id: "maf",
    name: "Market Access Fund",
    shortName: "Market Access Fund",
    color: "#0d8240",
    textOnColor: "#ffffff",
    tint: "#e7f0e4",
    blurb:
      "The Market Access Fund provides grant money to reduce financial hardships for current BIPOC market participants in their first five years at AIM markets.",
    url: "https://www.agriculturalinstitute.org/market-access-fund",
  },
  farmer: {
    id: "farmer",
    name: "Farmer Incubator Booth",
    shortName: "Farmer Incubator",
    color: "#4db547",
    textOnColor: "#0b3d1e",
    tint: "#edf6e9",
    blurb:
      "A year of free market access for beginning farmers, run with Kitchen Table Advisors and ALBA. Cohorts rotate through the Clement St., Hayward, and Grand Lake markets.",
    url: "https://www.agriculturalinstitute.org/farmers-market-incubator-booth",
  },
  foodmaker: {
    id: "foodmaker",
    name: "Food Maker Incubator Booth",
    shortName: "Food Maker Incubator",
    color: "#de752c",
    textOnColor: "#ffffff",
    tint: "#faeee1",
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
  // Portrait published on AIM's own program page, when one exists.
  aimPhoto?: string;
}

const SQS = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";

export const ROSTER_2026: RosterEntry[] = [
  // Market Access Fund, 2026 cohort (order and portraits match AIM's page)
  { person: "Alicia Waters", business: "MalDoni's", program: "maf", match: "maldoni",
    aimPhoto: `${SQS}/5a3b2bf2-53dc-4dd4-9e6e-e910b31e458f/AW+_+Maldonis+Booth+-+Alicia+Waters.png?format=500w` },
  { person: "Carlos Salgado", business: "Salviricans", program: "maf", match: "salvirican",
    aimPhoto: `${SQS}/4be6ee11-ff5e-4cda-b09d-1599fef5e221/Carlos+Salgado%2C+Salviricans.jpeg?format=500w` },
  { person: "Chen Huang", business: "Luna's Good Cat and Dog Treats", program: "maf", match: "luna's good",
    aimPhoto: `${SQS}/978e2fdb-bc9f-4535-b0ee-5a32616d5ca4/Chen+Huang%2C+Luna%27s+Good+Cat+and+Dog+Treats.png?format=500w` },
  { person: "Dalene Dematteis", business: "Dangerously Delicious Desserts", program: "maf", match: "dangerously delicious",
    aimPhoto: `${SQS}/179bd8b4-90f3-40fc-ae7c-9080244abc8e/3E6AF602-0199-4D2F-90FE-8606C11ED4682025-10-11_11-01-38_570+-+Dalene+Moodley.jpeg?format=500w` },
  { person: "James Hong", business: "Lion Kings", program: "maf", match: "lion kings",
    aimPhoto: `${SQS}/079c03c7-6f94-40d3-9ef9-c44110da15dd/tempImageSiIRdw.jpg?format=500w` },
  { person: "Minyi Liu", business: "Yi Lemon & Yi Mian", program: "maf", match: "yi lemon",
    aimPhoto: `${SQS}/421aee1d-1d72-4b4f-b4c8-07b2572b3a6f/IMG_2037.jpg?format=500w` },
  { person: "Maria Zavala", business: "Blooming Maria's Flower Farm", program: "maf", match: "blooming maria",
    aimPhoto: `${SQS}/9d55f9d8-b936-4f0c-aa99-815d7f9f32f9/IMG_8862+-+MARIA+ZAVALA.jpeg?format=500w` },
  { person: "Nirali Maru", business: "Leafy Veda", program: "maf", match: "leafy veda",
    aimPhoto: `${SQS}/5b0b44a0-ddfb-43f4-9d3a-35e46688bfa9/tempImage6oFJnx.jpg?format=500w` },
  { person: "Sayaka Tani", business: "Nobunaga's Blue Ribbon", program: "maf", match: "nobunaga",
    aimPhoto: `${SQS}/ee5845af-5a82-43aa-a652-df467c8cf89c/Sayaka+Tani%2C+Nobunaga%27s+Blue+Ribbon.jpg?format=500w` },
  { person: "Vineeta Chand", business: "Snoring Orange Studio", program: "maf", match: "snoring orange",
    aimPhoto: `${SQS}/b025df2b-5bdd-4b65-bb7e-b09f5c8354cd/Chand.BioPic2+-+Vineeta+at+SnoringOrangeStudio.jpg?format=500w` },
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

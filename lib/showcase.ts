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
    // Gold, so the MAF tab reads distinctly from the dark-green All tab.
    // Swap for the final flyer hex when Shayla confirms it.
    color: "#d29c13",
    textOnColor: "#3c2e00",
    tint: "#f7efd7",
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
  // Cohort year, e.g. "2026". Current cohort vs. alumni is derived from `alum`.
  cohort: string;
  alum?: boolean;
  // Extra program-membership tags, e.g. a MAF alum who also graduated from
  // the Farmer Incubator. Exact years arrive with the admin-panel backfill.
  alsoTags?: string[];
  // Portrait published on AIM's own program page, when one exists.
  aimPhoto?: string;
}

const SQS = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";

export const ROSTER_2026: RosterEntry[] = [
  // Market Access Fund, 2026 cohort (order and portraits match AIM's page)
  { person: "Alicia Waters", business: "MalDoni's", program: "maf", cohort: "2026", match: "maldoni",
    aimPhoto: `${SQS}/5a3b2bf2-53dc-4dd4-9e6e-e910b31e458f/AW+_+Maldonis+Booth+-+Alicia+Waters.png?format=500w` },
  { person: "Carlos Salgado", business: "Salviricans", program: "maf", cohort: "2026", match: "salvirican",
    aimPhoto: `${SQS}/4be6ee11-ff5e-4cda-b09d-1599fef5e221/Carlos+Salgado%2C+Salviricans.jpeg?format=500w` },
  { person: "Chen Huang", business: "Luna's Good Cat and Dog Treats", program: "maf", cohort: "2026", match: "luna's good",
    aimPhoto: `${SQS}/978e2fdb-bc9f-4535-b0ee-5a32616d5ca4/Chen+Huang%2C+Luna%27s+Good+Cat+and+Dog+Treats.png?format=500w` },
  { person: "Dalene Dematteis", business: "Dangerously Delicious Desserts", program: "maf", cohort: "2026", match: "dangerously delicious",
    aimPhoto: `${SQS}/179bd8b4-90f3-40fc-ae7c-9080244abc8e/3E6AF602-0199-4D2F-90FE-8606C11ED4682025-10-11_11-01-38_570+-+Dalene+Moodley.jpeg?format=500w` },
  { person: "James Hong", business: "Lion Kings", program: "maf", cohort: "2026", match: "lion kings",
    aimPhoto: `${SQS}/079c03c7-6f94-40d3-9ef9-c44110da15dd/tempImageSiIRdw.jpg?format=500w` },
  { person: "Minyi Liu", business: "Yi Lemon & Yi Mian", program: "maf", cohort: "2026", match: "yi lemon",
    aimPhoto: `${SQS}/421aee1d-1d72-4b4f-b4c8-07b2572b3a6f/IMG_2037.jpg?format=500w` },
  { person: "Maria Zavala", business: "Blooming Maria's Flower Farm", program: "maf", cohort: "2026", match: "blooming maria",
    aimPhoto: `${SQS}/9d55f9d8-b936-4f0c-aa99-815d7f9f32f9/IMG_8862+-+MARIA+ZAVALA.jpeg?format=500w` },
  { person: "Nirali Maru", business: "Leafy Veda", program: "maf", cohort: "2026", match: "leafy veda",
    aimPhoto: `${SQS}/5b0b44a0-ddfb-43f4-9d3a-35e46688bfa9/tempImage6oFJnx.jpg?format=500w` },
  { person: "Sayaka Tani", business: "Nobunaga's Blue Ribbon", program: "maf", cohort: "2026", match: "nobunaga",
    aimPhoto: `${SQS}/ee5845af-5a82-43aa-a652-df467c8cf89c/Sayaka+Tani%2C+Nobunaga%27s+Blue+Ribbon.jpg?format=500w` },
  { person: "Vineeta Chand", business: "Snoring Orange Studio", program: "maf", cohort: "2026", match: "snoring orange",
    aimPhoto: `${SQS}/b025df2b-5bdd-4b65-bb7e-b09f5c8354cd/Chand.BioPic2+-+Vineeta+at+SnoringOrangeStudio.jpg?format=500w` },
  // Farmer Incubator Booth, 2026 cohort
  { person: "Antonia Vega Gonzalez", business: "Dulce Organic Farms", program: "farmer", cohort: "2026", match: "dulce organic" },
  { person: "Maria Magdalena Lopez Poiras", business: "Tierra de Esperanza", program: "farmer", cohort: "2026", match: "tierra de esperanza" },
  { person: "Luis A Cervantes Mendoza", business: "Monarca Berry Farm", program: "farmer", cohort: "2026", match: "monarca" },
  { person: "Salvador Ruiz", business: "Products from Paradise", program: "farmer", cohort: "2026", match: "products from paradise" },
  { person: "Martin Avina Hernandez", business: "Avina Organic Farm", program: "farmer", cohort: "2026", match: "avina" },
  { person: "Eduardo Medrano", business: "E&N Organic Farm", program: "farmer", cohort: "2026", match: "e&n organic" },
];

// Market Access Fund alumni, as published in the Alumni section of AIM's
// market-access-fund page. Alumni still vending in AIM markets pick up their
// photo and market schedule from the feed join automatically.
export const ALUMNI: RosterEntry[] = [
  { person: "Alberto Mendoza", business: "Ayoquezco Organic Farm", program: "maf", cohort: "2025", alum: true, match: "ayoquezco", alsoTags: ["Farmer Incubator graduate"] },
  { person: "Sheila Hilliard", business: "Boss Seasoning", program: "maf", cohort: "2025", alum: true, match: "boss seasoning" },
  { person: "Sade Adeyemi", business: "Herbal Alchemist", program: "maf", cohort: "2025", alum: true, match: "herbal alchemist" },
  { person: "Celsa Ortega", business: "Induchucuiti Organic Farm", program: "maf", cohort: "2025", alum: true, match: "induchucuiti", alsoTags: ["Farmer Incubator graduate"] },
  { person: "Curtis Aikens", business: "Marin County Cooperation Team", program: "maf", cohort: "2025", alum: true, match: "cooperation team" },
  { person: "Baltazar Caballero", business: "Mixteco Organic Produce", program: "maf", cohort: "2025", alum: true, match: "mixteco", alsoTags: ["Farmer Incubator graduate"] },
  { person: "Andrea Morelos", business: "Seasonal Sweetss", program: "maf", cohort: "2025", alum: true, match: "seasonal sweet" },
  { person: "Charles McDonald", business: "Sip to Live", program: "maf", cohort: "2025", alum: true, match: "sip to live" },
  { person: "Deborah Michail", business: "Tavus", program: "maf", cohort: "2025", alum: true, match: "tavus" },
  { person: "Eleuterio Zarate Salinas", business: "Zarate Family Farm", program: "maf", cohort: "2025", alum: true, match: "zarate" },
  { person: "Meaza Haile", business: "8 AM Fashion", program: "maf", cohort: "2024", alum: true, match: "8 am fashion" },
  { person: "Bettina Yap", business: "Baby and Boy Pastries", program: "maf", cohort: "2024", alum: true, match: "baby and boy" },
  { person: "Andre Thomas", business: "Dre's Jams and Jellies", program: "maf", cohort: "2024", alum: true, match: "dre's jams" },
  { person: "Elliott Johnson", business: "Goldi's Gourmet Spices", program: "maf", cohort: "2024", alum: true, match: "goldi's" },
  { person: "Yuko Kaneko", business: "Kinoko", program: "maf", cohort: "2024", alum: true, match: "kinoko" },
  { person: "Meera Deveriya", business: "Meera's", program: "maf", cohort: "2024", alum: true, match: "meera's" },
  { person: "Nadia Montoya", business: "Nadia's Desserts", program: "maf", cohort: "2024", alum: true, match: "nadia's desserts" },
  { person: "Adjowah Brodie", business: "The Weekend Store", program: "maf", cohort: "2024", alum: true, match: "weekend store" },
  { person: "Li Xu", business: "Yeso Coconut", program: "maf", cohort: "2024", alum: true, match: "yeso coconut" },
  { person: "Annie Wang", business: "Annie's T Cakes", program: "maf", cohort: "2023", alum: true, match: "annie's t cakes" },
  { person: "Sway Soturi", business: "Forest & Flour", program: "maf", cohort: "2023", alum: true, match: "forest & flour" },
  { person: "Giovanna Rodriguez", business: "Gigi's One-Bite Wonder", program: "maf", cohort: "2023", alum: true, match: "gigi's one" },
  { person: "Stephen Cajilig", business: "Golden Morsels", program: "maf", cohort: "2023", alum: true, match: "golden morsels" },
  { person: "Tatiana Thomas", business: "Josephine's Southern Cuisine", program: "maf", cohort: "2023", alum: true, match: "josephine's southern" },
  { person: "Comfort Asobo", business: "Mimbo Kitchen", program: "maf", cohort: "2023", alum: true, match: "mimbo" },
  { person: "Jenny Fong", business: "Modern Shibori", program: "maf", cohort: "2023", alum: true, match: "modern shibori" },
  { person: "Darren Oyobio", business: "Mossed Juicery", program: "maf", cohort: "2023", alum: true, match: "mossed" },
  { person: "Cecilia Liang", business: "Nuttea Organics", program: "maf", cohort: "2023", alum: true, match: "nuttea" },
  { person: "Everardo Solorio", business: "Solorio's Organic Farm", program: "maf", cohort: "2023", alum: true, match: "solorio", alsoTags: ["Farmer Incubator graduate"] },
  { person: "Teyonna Allen", business: "Sweet Tey's", program: "maf", cohort: "2023", alum: true, match: "sweet tey" },
  { person: "Bria Hutson", business: "Tha MF'n Vegan", program: "maf", cohort: "2023", alum: true, match: "tha mf" },
  { person: "Rachel Russell", business: "Chestnut Street Granola", program: "maf", cohort: "2022", alum: true, match: "chestnut street" },
  { person: "Isaiah Powell", business: "Dragonspunk GRO", program: "maf", cohort: "2022", alum: true, match: "dragonspunk" },
  { person: "Imani Glover", business: "The Lemonade Bar", program: "maf", cohort: "2022", alum: true, match: "lemonade bar" },
  { person: "Roselle Arianne Capili", business: "Mac'd With Love", program: "maf", cohort: "2022", alum: true, match: "mac'd with love" },
  { person: "Reggie Borders and Nicole Felix", business: "Pound Bizness", program: "maf", cohort: "2022", alum: true, match: "pound bizness" },
  { person: "Jamil Burns", business: "Raised Roots", program: "maf", cohort: "2022", alum: true, match: "raised roots" },
  { person: "Scott Chang-Fleeman", business: "Shao Shan Farm", program: "maf", cohort: "2022", alum: true, match: "shao shan" },
];

// Farmer Incubator graduates, as listed on AIM's incubator-booth page.
// The page publishes names only; cohort years arrive via the intake process.
export const FARMER_GRADUATES: string[] = [
  "Solorio's Organic Farm", "Coronel Organic Produce", "Oaxaca", "Luna Dorado",
  "Narci's Organic Farm", "Tikal", "Anna's Organic Farm", "Queen Of Vegetables",
  "Salazar Organic Farm", "Vasquez Organic Farm", "Imperial Crops", "Coyo Organics",
  "Mixteco", "Indichucuiti Organic Farm", "Ayoquezco Organic Farm", "Royally Grown",
  "Angela's Ranch", "Ventura Organic", "Buena Vista", "Siembra Y Cosecha",
  "My Organic Farm", "Lopez Organic Farm", "Alpha Y Omega", "La Buena Tierra",
];

export interface Profile extends RosterEntry {
  vendor: Vendor | null;
}

export function buildProfiles(vendors: Vendor[], entries: RosterEntry[] = ROSTER_2026): Profile[] {
  return entries.map((entry) => ({
    ...entry,
    vendor:
      vendors.find((v) =>
        v.company.toLowerCase().includes(entry.match.toLowerCase())
      ) ?? null,
  }));
}

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
  // Application window copy; placeholder until Jack confirms each timeline.
  applyWindow?: string;
  // Public application form, when the program has one. Staff /edit links and
  // login-walled forms (like MAF onboarding) stay off the public page.
  applyUrl?: string;
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
      "The Market Access Fund is designed to grow existing Black, Indigenous, and people of color (BIPOC)-owned businesses who have been in AIM markets less than five years. Many Incubator Booth graduates use this program as a next step in their growth.",
    url: "https://www.agriculturalinstitute.org/market-access-fund",
    applyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSePDXM2P7i72F1DWmxhA-gkynRc1S2OBjQ9zqWV3wYYaFYQ2Q/viewform",
  },
  farmer: {
    id: "farmer",
    name: "Farmer Incubator Booth",
    shortName: "Farmer Incubator",
    color: "#4db547",
    textOnColor: "#0b3d1e",
    tint: "#edf6e9",
    blurb:
      "The Farmer Incubator Booth brings new farmers into our markets, free of charge. AIM partners with Kitchen Table Advisors (KTA) and Agriculture and Land-Based Training Association (ALBA) to create new agriculture business.",
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
      "The Food Maker Incubator Booth brings Marin food businesses into our Marin markets, free of charge. We focus on uplifting West Marin, Marin City, San Rafael's Canal neighborhood, and Southern Novato food makers.",
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
  // AIM-supplied 1080x1350 portrait served from /public/participants.
  // These are shot to spec, so the profile view fills the frame with them.
  photo?: string;
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
  { person: "Antonia Vega Gonzalez", business: "Dulce Organic Farms", program: "farmer", cohort: "2026", match: "dulce organic", photo: "/participants/dulce-organic-farms.jpg" },
  { person: "Maria Magdalena Lopez Poiras", business: "Tierra de Esperanza", program: "farmer", cohort: "2026", match: "tierra de esperanza", photo: "/participants/tierra-de-esperanza.jpg" },
  { person: "Luis A Cervantes Mendoza", business: "Monarca Berry Farm", program: "farmer", cohort: "2026", match: "monarca", photo: "/participants/monarca-berry-farm.jpg" },
  { person: "Salvador Ruiz", business: "Products from Paradise", program: "farmer", cohort: "2026", match: "products from paradise", photo: "/participants/products-from-paradise.jpg" },
  { person: "Martin Avina Hernandez", business: "Avina Organic Farm", program: "farmer", cohort: "2026", match: "avina", photo: "/participants/avina-organic-farm.jpg" },
  { person: "Eduardo Medrano", business: "E&N Organic Farm", program: "farmer", cohort: "2026", match: "e&n organic", photo: "/participants/en-organic-farm.jpg" },
];

// Market Access Fund alumni, as published in the Alumni section of AIM's
// market-access-fund page. Alumni still vending in AIM markets pick up their
// photo and market schedule from the feed join automatically.
export const ALUMNI: RosterEntry[] = [
  { person: "Alberto Mendoza", business: "Ayoquezco Organic Farm", program: "maf", cohort: "2025", alum: true, match: "ayoquezco", alsoTags: ["Farmer Incubator graduate"], photo: "/participants/ayoquezco-organic-farm-maf.jpg" },
  { person: "Sheila Hilliard", business: "Boss Seasoning", program: "maf", cohort: "2025", alum: true, match: "boss seasoning", photo: "/participants/boss-seasoning.jpg" },
  { person: "Sade Adeyemi", business: "Herbal Alchemist", program: "maf", cohort: "2025", alum: true, match: "herbal alchemist", photo: "/participants/herbal-alchemist.jpg" },
  { person: "Celsa Ortega", business: "Induchucuiti Organic Farm", program: "maf", cohort: "2025", alum: true, match: "induchucuiti", alsoTags: ["Farmer Incubator graduate"], photo: "/participants/induchucuiti-organic-farm-maf.jpg" },
  { person: "Curtis Aikens", business: "Marin County Cooperation Team", program: "maf", cohort: "2025", alum: true, match: "cooperation team", photo: "/participants/marin-county-cooperation-team.jpg" },
  { person: "Baltazar Caballero", business: "Mixteco Organic Produce", program: "maf", cohort: "2025", alum: true, match: "mixteco", alsoTags: ["Farmer Incubator graduate"], photo: "/participants/mixteco-organic-produce-maf.jpg" },
  { person: "Andrea Morelos", business: "Seasonal Sweetss", program: "maf", cohort: "2025", alum: true, match: "seasonal sweet", photo: "/participants/seasonal-sweetss.jpg" },
  { person: "Charles McDonald", business: "Sip to Live", program: "maf", cohort: "2025", alum: true, match: "sip to live", photo: "/participants/sip-to-live.jpg" },
  { person: "Deborah Michail", business: "Tavus", program: "maf", cohort: "2025", alum: true, match: "tavus", photo: "/participants/tavus.jpg" },
  { person: "Eleuterio Zarate Salinas", business: "Zarate Family Farm", program: "maf", cohort: "2025", alum: true, match: "zarate", photo: "/participants/zarate-family-farm.jpg" },
  { person: "Meaza Haile", business: "8 AM Fashion", program: "maf", cohort: "2024", alum: true, match: "8 am fashion", photo: "/participants/8-am-fashion.jpg" },
  { person: "Bettina Yap", business: "Baby and Boy Pastries", program: "maf", cohort: "2024", alum: true, match: "baby and boy", photo: "/participants/baby-and-boy-pastries.jpg" },
  { person: "Andre Thomas", business: "Dre's Jams and Jellies", program: "maf", cohort: "2024", alum: true, match: "dre's jams", photo: "/participants/dres-jams-and-jellies.jpg" },
  { person: "Elliott Johnson", business: "Goldi's Gourmet Spices", program: "maf", cohort: "2024", alum: true, match: "goldi's", photo: "/participants/goldis-gourmet-spices.jpg" },
  { person: "Yuko Kaneko", business: "Kinoko", program: "maf", cohort: "2024", alum: true, match: "kinoko", photo: "/participants/kinoko.jpg" },
  { person: "Meera Deveriya", business: "Meera's", program: "maf", cohort: "2024", alum: true, match: "meera's", photo: "/participants/meeras.jpg" },
  { person: "Nadia Montoya", business: "Nadia's Desserts", program: "maf", cohort: "2024", alum: true, match: "nadia's desserts", photo: "/participants/nadias-desserts.jpg" },
  { person: "Adjowah Brodie", business: "The Weekend Store", program: "maf", cohort: "2024", alum: true, match: "weekend store", photo: "/participants/the-weekend-store.jpg" },
  { person: "Li Xu", business: "Yeso Coconut", program: "maf", cohort: "2024", alum: true, match: "yeso coconut", photo: "/participants/yeso-coconut.jpg" },
  { person: "Annie Wang", business: "Annie's T Cakes", program: "maf", cohort: "2023", alum: true, match: "annie's t cakes" },
  { person: "Sway Soturi", business: "Forest & Flour", program: "maf", cohort: "2023", alum: true, match: "forest & flour", photo: "/participants/forest-and-flour.jpg" },
  { person: "Giovanna Rodriguez", business: "Gigi's One-Bite Wonder", program: "maf", cohort: "2023", alum: true, match: "gigi's one", photo: "/participants/gigis-one-bite-wonder.jpg" },
  { person: "Stephen Cajilig", business: "Golden Morsels", program: "maf", cohort: "2023", alum: true, match: "golden morsels", photo: "/participants/golden-morsels.jpg" },
  { person: "Tatiana Thomas", business: "Josephine's Southern Cuisine", program: "maf", cohort: "2023", alum: true, match: "josephine's southern", photo: "/participants/josephines-southern-cuisine.jpg" },
  { person: "Comfort Asobo", business: "Mimbo Kitchen", program: "maf", cohort: "2023", alum: true, match: "mimbo" },
  { person: "Jenny Fong", business: "Modern Shibori", program: "maf", cohort: "2023", alum: true, match: "modern shibori", photo: "/participants/modern-shibori.jpg" },
  { person: "Darren Oyobio", business: "Mossed Juicery", program: "maf", cohort: "2023", alum: true, match: "mossed", photo: "/participants/mossed-juicery.jpg" },
  { person: "Cecilia Liang", business: "Nuttea Organics", program: "maf", cohort: "2023", alum: true, match: "nuttea", photo: "/participants/nuttea-organics.jpg" },
  { person: "Everardo Solorio", business: "Solorio's Organic Farm", program: "maf", cohort: "2023", alum: true, match: "solorio", alsoTags: ["Farmer Incubator graduate"], photo: "/participants/solorios-organic-farm-maf.jpg" },
  { person: "Teyonna Allen", business: "Sweet Tey's", program: "maf", cohort: "2023", alum: true, match: "sweet tey", photo: "/participants/sweet-teys.jpg" },
  { person: "Bria Hutson", business: "Tha MF'n Vegan", program: "maf", cohort: "2023", alum: true, match: "tha mf", photo: "/participants/tha-mfn-vegan.jpg" },
  { person: "Rachel Russell", business: "Chestnut Street Granola", program: "maf", cohort: "2022", alum: true, match: "chestnut street", photo: "/participants/chestnut-street-granola.jpg" },
  { person: "Isaiah Powell", business: "Dragonspunk GRO", program: "maf", cohort: "2022", alum: true, match: "dragonspunk", photo: "/participants/dragonspunk-gro.jpg" },
  { person: "Imani Glover", business: "The Lemonade Bar", program: "maf", cohort: "2022", alum: true, match: "lemonade bar" },
  { person: "Roselle Arianne Capili", business: "Mac'd With Love", program: "maf", cohort: "2022", alum: true, match: "mac'd with love", photo: "/participants/macd-with-love.jpg" },
  { person: "Reggie Borders and Nicole Felix", business: "Pound Bizness", program: "maf", cohort: "2022", alum: true, match: "pound bizness", photo: "/participants/pound-bizness.jpg" },
  { person: "Jamil Burns", business: "Raised Roots", program: "maf", cohort: "2022", alum: true, match: "raised roots", photo: "/participants/raised-roots.jpg" },
  { person: "Scott Chang-Fleeman", business: "Shao Shan Farm", program: "maf", cohort: "2022", alum: true, match: "shao shan", photo: "/participants/shao-shan-farm.jpg" },
];

// Farmer Incubator graduates. Cohort assignments and portraits come from
// AIM's 2026-09 photo set (filenames carry the cohort). Years land with
// the admin backfill; until then the cohort label is shown as-is.
export const FARMER_ALUMNI: RosterEntry[] = [
  { person: "", business: "Solorio's Organic Farm", program: "farmer", cohort: "Cohort 1", alum: true, match: "solorio", alsoTags: ["Market Access Fund 2023"], photo: "/participants/solorios-organic-farm.jpg" },
  { person: "", business: "Coronel Organic Produce", program: "farmer", cohort: "Cohort 1", alum: true, match: "coronel", photo: "/participants/coronel-organic-produce.jpg" },
  { person: "", business: "Oaxaca", program: "farmer", cohort: "Cohort 1", alum: true, match: "oaxaca", photo: "/participants/oaxaca.jpg" },
  { person: "", business: "Luna Dorado", program: "farmer", cohort: "Cohort 1", alum: true, match: "luna dorado", photo: "/participants/luna-dorado.jpg" },
  { person: "", business: "Narci's Organic Farm", program: "farmer", cohort: "Cohort 1", alum: true, match: "narci", photo: "/participants/narcis-organic-farm.jpg" },
  { person: "", business: "Tikal", program: "farmer", cohort: "Cohort 1", alum: true, match: "tikal", photo: "/participants/tikal.jpg" },
  { person: "", business: "Anna's Organic Farm", program: "farmer", cohort: "Cohort 1", alum: true, match: "anna's organic", photo: "/participants/annas-organic-farm.jpg" },
  { person: "", business: "Mimi's Organic Farm", program: "farmer", cohort: "Cohort 1", alum: true, match: "mimi's organic", photo: "/participants/mimis-organic-farm.jpg" },
  { person: "", business: "Ayoquezco Organic Farm", program: "farmer", cohort: "Cohort 2", alum: true, match: "ayoquezco", alsoTags: ["Market Access Fund 2025"], photo: "/participants/ayoquezco-organic-farm.jpg" },
  { person: "", business: "Royally Grown", program: "farmer", cohort: "Cohort 2", alum: true, match: "royally grown", photo: "/participants/royally-grown.jpg" },
  { person: "", business: "Coyo Organics", program: "farmer", cohort: "Cohort 2", alum: true, match: "coyo", photo: "/participants/coyo-organics.jpg" },
  { person: "", business: "Salazar Organic Farm", program: "farmer", cohort: "Cohort 2", alum: true, match: "salazar organic", photo: "/participants/salazar-organic-farm.jpg" },
  { person: "", business: "Vasquez Organic Farm", program: "farmer", cohort: "Cohort 2", alum: true, match: "vasquez organic", photo: "/participants/vasquez-organic-farm.jpg" },
  { person: "", business: "Indichucuiti Organic Farm", program: "farmer", cohort: "Cohort 2", alum: true, match: "induchucuiti", alsoTags: ["Market Access Fund 2025"], photo: "/participants/indichucuiti-organic-farm.jpg" },
  { person: "", business: "Mixteco", program: "farmer", cohort: "Cohort 2", alum: true, match: "mixteco", alsoTags: ["Market Access Fund 2025"], photo: "/participants/mixteco.jpg" },
  { person: "", business: "Imperial Crops", program: "farmer", cohort: "Cohort 2", alum: true, match: "imperial crops", photo: "/participants/imperial-crops.jpg" },
  { person: "", business: "Queen Of Vegetables", program: "farmer", cohort: "Cohort 2", alum: true, match: "queen of vegetables", photo: "/participants/queen-of-vegetables.jpg" },
  { person: "", business: "My Organic Farm", program: "farmer", cohort: "Cohort 3", alum: true, match: "my organic farm", photo: "/participants/my-organic-farm.jpg" },
  { person: "", business: "Siembra Y Cosecha", program: "farmer", cohort: "Cohort 3", alum: true, match: "siembra", photo: "/participants/siembra-y-cosecha.jpg" },
  { person: "", business: "Ventura Organic", program: "farmer", cohort: "Cohort 3", alum: true, match: "ventura organic", photo: "/participants/ventura-organic.jpg" },
  { person: "", business: "Angela's Ranch", program: "farmer", cohort: "Cohort 3", alum: true, match: "angela's ranch", photo: "/participants/angelas-ranch.jpg" },
  { person: "", business: "Alpha Y Omega", program: "farmer", cohort: "Cohort 3", alum: true, match: "alpha y omega", photo: "/participants/alpha-y-omega.jpg" },
  { person: "", business: "Buena Vista", program: "farmer", cohort: "Cohort 3", alum: true, match: "buena vista", photo: "/participants/buena-vista.jpg" },
  { person: "", business: "La Buena Tierra", program: "farmer", cohort: "Cohort 3", alum: true, match: "la buena tierra", photo: "/participants/la-buena-tierra.jpg" },
  { person: "", business: "Lopez Organic Farm", program: "farmer", cohort: "Cohort 3", alum: true, match: "lopez organic", photo: "/participants/lopez-organic-farm.jpg" },
];

// Food Maker Incubator cohorts, from AIM's 2026-09 photo set.
export const FOODMAKERS_CURRENT: RosterEntry[] = [
  { person: "", business: "Chiki's Tacos", program: "foodmaker", cohort: "2026", match: "chiki", photo: "/participants/chikis-tacos.jpg" },
  { person: "", business: "Coaster Cookies", program: "foodmaker", cohort: "2026", match: "coaster cookies", photo: "/participants/coaster-cookies.jpg" },
  { person: "", business: "Bakery 6", program: "foodmaker", cohort: "2026", match: "bakery 6", photo: "/participants/bakery-6.jpg" },
  { person: "", business: "Sweet Treat Marin", program: "foodmaker", cohort: "2026", match: "sweet treat marin", photo: "/participants/sweet-treat-marin.jpg" },
  { person: "", business: "Fully'z VeSoul Cafe", program: "foodmaker", cohort: "2026", match: "vesoul", photo: "/participants/fullyz-vesoul-cafe.jpg" },
  { person: "", business: "Suki", program: "foodmaker", cohort: "2026", match: "suki", photo: "/participants/suki.jpg" },
];

export const FOODMAKER_ALUMNI: RosterEntry[] = [
  { person: "", business: "Two Pots and a Pan", program: "foodmaker", cohort: "Cohort 1", alum: true, match: "two pots", photo: "/participants/two-pots-and-a-pan.jpg" },
  { person: "", business: "El Sabor de Tabasco", program: "foodmaker", cohort: "Cohort 1", alum: true, match: "sabor de tabasco", photo: "/participants/el-sabor-de-tabasco.jpg" },
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

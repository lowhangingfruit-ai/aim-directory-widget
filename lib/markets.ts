// Everything the directory knows about each AIM market. Hours and addresses
// follow AIM's Market Directory page (agriculturalinstitute.org/farmers-markets).
// Colors are sampled from the logo files: `background` is the logo's own
// background at the 500px size the cards load, `art` is its signature color.

export type RegionID = "east" | "north" | "sf";

export interface Market {
  id: number;
  name: string;
  day: string;
  hours: string;
  address: string;
  city: string;
  region: RegionID;
  seasonal: boolean;
  aimPage: string; // the market's page on AIM's site: map, parking, details
  logo: string;
  background: string;
  art: string;
  lat: number;
  lng: number;
}

const LOGO_BASE = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";
const AIM = "https://www.agriculturalinstitute.org";
const logo = (path: string) => `${LOGO_BASE}/${path}?format=500w`;
const MARIN_LOGO = logo("10074cb7-fd6e-4c7c-8629-4fb8a71fa9ea/marin.logo_on_yellow.jpg");

// In the order AIM's Market Directory page lists them.
export const MARKET_LIST: Market[] = [
  {
    id: 7784, name: "Hayward", day: "Saturdays", hours: "9am to 1pm",
    address: "777 B Street", city: "Hayward", region: "east", seasonal: false,
    aimPage: `${AIM}/hayward`, logo: logo("9f0695f7-5bbf-497a-afec-e04e45870cda/hayward.logo_on_pink.jpg"),
    background: "#ffdcc8", art: "#73a01f", lat: 37.6712, lng: -122.0856,
  },
  {
    id: 7785, name: "Grand Lake", day: "Saturdays", hours: "9am to 2pm",
    address: "Splash Pad Park, 746 Grand Ave", city: "Oakland", region: "east", seasonal: false,
    aimPage: `${AIM}/grand-lake`, logo: logo("1607976402789-E45K4WYYS5OCMOE24XG4/grandlake.logo_on_green.jpg"),
    background: "#dcfad9", art: "#038670", lat: 37.8114, lng: -122.2488,
  },
  {
    id: 7781, name: "Newark", day: "Sundays", hours: "9am to 1pm",
    address: "2086 Newpark Mall Rd", city: "Newark", region: "east", seasonal: false,
    aimPage: `${AIM}/newark`, logo: logo("1607976531072-1VE3CAJJSAIRAFFE65Z7/newark.logo_on_peach.jpg"),
    background: "#ffcb91", art: "#533180", lat: 37.5297, lng: -122.0402,
  },
  {
    id: 7786, name: "Thursday Marin", day: "Thursdays", hours: "8am to 1pm",
    address: "10 Ave of the Flags", city: "San Rafael", region: "north", seasonal: false,
    aimPage: `${AIM}/thursday-marin`, logo: MARIN_LOGO,
    background: "#ffec68", art: "#fa03a3", lat: 38.0036, lng: -122.5312,
  },
  {
    id: 7776, name: "Sunday Marin", day: "Sundays", hours: "8am to 1pm",
    address: "3501 Civic Center Dr.", city: "San Rafael", region: "north", seasonal: false,
    aimPage: `${AIM}/sunday-marin`, logo: MARIN_LOGO,
    background: "#ffec68", art: "#fa03a3", lat: 37.998, lng: -122.5307,
  },
  {
    id: 7803, name: "Point Reyes", day: "Saturdays, May to September", hours: "9am to 2pm",
    address: "11250 CA-1", city: "Point Reyes Station", region: "north", seasonal: true,
    aimPage: `${AIM}/point-reyes`, logo: logo("040d3d2e-68cb-4196-be5e-b06e6090b108/pointreyes.logo_on_blue.jpg"),
    background: "#c1d1eb", art: "#cb224f", lat: 38.0681, lng: -122.8053,
  },
  {
    id: 8211, name: "San Rafael Summer", day: "One Friday a month, May to September", hours: "5pm to 9pm",
    address: "Fourth Street, between A and Lootens", city: "San Rafael", region: "north", seasonal: true,
    aimPage: `${AIM}/san-rafael-summer-1`, logo: logo("1607976583988-S19RDA6H1M7KI7F2WBGB/sanrafael.logo_on_blue.jpg"),
    background: "#c2e8ef", art: "#23ae4c", lat: 37.9743, lng: -122.5397,
  },
  {
    id: 7782, name: "Clement St", day: "Sundays", hours: "9am to 2pm",
    address: "244 Clement St.", city: "San Francisco", region: "sf", seasonal: false,
    aimPage: `${AIM}/clement-st`, logo: logo("4b2c106f-4eda-4004-b832-a213b950eccd/clement.logo_on_yellow.jpg"),
    background: "#ebf985", art: "#ec431e", lat: 37.7831, lng: -122.4617,
  },
  {
    id: 7783, name: "Stonestown", day: "Sundays", hours: "9am to 1pm",
    address: "501 Buckingham Way", city: "San Francisco", region: "sf", seasonal: false,
    aimPage: `${AIM}/stonestown`, logo: logo("1607976598459-TZZWCTC8QDCHJ7AS6L7T/stonestown.logo_on_green.jpg"),
    background: "#baffdc", art: "#ffba8e", lat: 37.7297, lng: -122.4791,
  },
];

export const MARKET_BY_ID: Record<number, Market> = Object.fromEntries(MARKET_LIST.map((m) => [m.id, m]));

export const REGIONS: { id: RegionID; title: string; note: string }[] = [
  { id: "east", title: "East Bay", note: "Open year-round, rain or shine." },
  { id: "north", title: "North Bay", note: "Thursday and Sunday Marin are open year-round, rain or shine. Point Reyes and San Rafael Summer are seasonal." },
  { id: "sf", title: "San Francisco", note: "Open year-round, rain or shine." },
];

export function directionsUrl(m: Market): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${m.address}, ${m.city}, CA`)}`;
}

// Straight-line miles between two points, for "about N miles from" in profiles.
export function milesBetween(a: [number, number], b: [number, number]): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

// Logo colors are used as they are. Text takes a logo color only where it stays
// readable on the background behind it; otherwise it is near-black.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export function readable(fg: string, bg: string, min: number): string {
  return contrast(fg, bg) >= min ? fg : "#111111";
}

export function textOn(fill: string): string {
  return contrast("#ffffff", fill) >= contrast("#111111", fill) ? "#ffffff" : "#111111";
}

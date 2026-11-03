// Writes a small made-up Manage My Market feed for the end-to-end tests, with
// market dates relative to today so the tests never go stale. The names are
// invented; the live directory never shows this file.
import { writeFileSync } from "node:fs";

const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date()) + "T12:00:00");
const nextWeekday = (weekday, weeksAhead) => {
  const d = new Date(today);
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7) + 7 * weeksAhead);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};
const sundays = [0, 1, 2].map((w) => nextWeekday(0, w));
const saturdays = [0, 1, 2].map((w) => nextWeekday(6, w));

const vendor = (o) => ({
  vendorID: o.id, company: o.company, type: "", phone1: o.phone ?? "", email: "private@example.com",
  address1: "1 Private Lane", city: o.city, state: "CA", description: o.description, website: o.website ?? "",
  photo: "", twitter_handle: "", facebook_profile: "", instagram_profile: o.instagram ?? "",
  permission: o.permission ?? true, markets: o.markets,
});

const vendors = [
  vendor({
    id: 900001, company: "Alder Creek Farm LLC", city: "PETALUMA", phone: "7075550101",
    description: "Family farm growing apples, persimmons, and winter greens.\n\nFind us at the north end of the market.",
    website: "aldercreek.example.com", instagram: "https://www.instagram.com/aldercreek",
    markets: [
      { marketID: 7776, market: "Sunday Marin", dates: sundays },
      { marketID: 7785, market: "Grand Lake", dates: saturdays },
    ],
  }),
  vendor({
    id: 900002, company: "Bayside Bakery", city: "Oakland", description: "Sourdough and pastries baked overnight.",
    markets: [{ marketID: 7785, market: "Grand Lake", dates: saturdays }],
  }),
  vendor({
    id: 900003, company: "Cedar Ridge Ranch", city: "Sebastopol", description: "Pasture-raised eggs and chicken.",
    markets: [{ marketID: 7776, market: "Sunday Marin", dates: sundays.slice(1) }],
  }),
  vendor({
    id: 900004, company: "Delta Dairy", city: "Lodi", description: "Has not agreed to be listed.", permission: false,
    markets: [{ marketID: 7776, market: "Sunday Marin", dates: sundays }],
  }),
];

writeFileSync(new URL("./.feed.txt", import.meta.url), `var mmmVendors = ${JSON.stringify(vendors)};`);

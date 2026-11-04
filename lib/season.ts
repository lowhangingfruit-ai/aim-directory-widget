// AIM's Northern California harvest calendar
// (agriculturalinstitute.org/crop-calendar). Months are 0 (January) to 11.
// `term` is what the directory searches for when a shopper picks the crop,
// `also` lists other names vendors use for it, and `not` lists phrases that
// contain a term but are something else ("cherry tomato" for cherries).

export interface Crop {
  name: string;
  term: string;
  also?: string[];
  not?: string[];
  months: number[];
}

// Whether a product name (or a vendor description) is this crop.
export function cropMatches(crop: Crop, text: string): boolean {
  // The phrases are cut out rather than ruling the text out, so a description
  // that mentions both ("cherries and cherry tomatoes") still matches.
  let t = text.toLowerCase();
  for (const n of crop.not ?? []) t = t.split(n).join(" ");
  return [crop.term, ...(crop.also ?? [])].some((term) => t.includes(term));
}

const span = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const ALL_YEAR = span(0, 11);

export const CROPS: Crop[] = [
  { name: "Artichokes", term: "artichoke", months: [...span(2, 5), ...span(8, 11)] },
  { name: "Asian greens", term: "greens", months: ALL_YEAR },
  { name: "Asparagus", term: "asparagus", months: span(1, 5) },
  { name: "Avocados", term: "avocado", months: ALL_YEAR },
  { name: "Beans", term: "bean", months: ALL_YEAR },
  { name: "Broccoli", term: "broccoli", months: ALL_YEAR },
  { name: "Brussels sprouts", term: "brussels", months: [...span(0, 2), ...span(8, 11)] },
  { name: "Carrots", term: "carrot", months: ALL_YEAR },
  { name: "Cauliflower", term: "cauliflower", months: [...span(0, 5), ...span(8, 11)] },
  { name: "Celery", term: "celery", months: ALL_YEAR },
  { name: "Corn", term: "corn", not: ["popcorn", "kettle corn", "corn chips", "corn flour"], months: span(5, 9) },
  { name: "Cucumbers", term: "cucumber", months: span(4, 10) },
  { name: "Eggplant", term: "eggplant", months: span(4, 9) },
  { name: "Lettuce", term: "lettuce", months: ALL_YEAR },
  { name: "Mushrooms", term: "mushroom", months: ALL_YEAR },
  { name: "Onions", term: "onion", months: ALL_YEAR },
  { name: "Parsnips", term: "parsnip", months: ALL_YEAR },
  { name: "Peas", term: "peas", not: ["black-eyed peas"], months: [...span(0, 4), ...span(9, 11)] },
  { name: "Bell peppers", term: "pepper", months: span(6, 9) },
  { name: "Potatoes", term: "potato", not: ["sweet potato"], months: span(4, 10) },
  { name: "Spinach", term: "spinach", months: [...span(0, 4), ...span(7, 11)] },
  { name: "Summer squash", term: "squash", months: ALL_YEAR },
  { name: "Winter squash", term: "squash", not: ["squash - summer", "summer squash", "squash blossom"], months: span(4, 8) },
  { name: "Sweet potatoes", term: "sweet potato", months: [...span(0, 1), ...span(8, 11)] },
  { name: "Tomatoes", term: "tomato", months: span(5, 9) },
  { name: "Apples", term: "apple", not: ["apple butter", "apple chips", "apple juice"], months: [...span(0, 1), ...span(7, 11)] },
  { name: "Apricots", term: "apricot", months: span(4, 6) },
  { name: "Blueberries", term: "blueberr", months: span(4, 7) },
  { name: "Cherries", term: "cherr", not: ["cherry tomato", "ground cherr"], months: span(3, 5) },
  {
    name: "Citrus",
    term: "citrus",
    also: ["mandarin", "orange", "lemons", "limes", "kumquat", "tangerine", "grapefruit", "satsuma", "yuzu", "citron", "pomelo"],
    not: ["lemonade", "orange juice", "lemon juice", "marmalade"],
    months: [...span(0, 2), 11],
  },
  { name: "Figs", term: "fig", not: ["trees - fig", "fig tree"], months: span(7, 10) },
  { name: "Grapes", term: "grape", not: ["grapefruit"], months: span(8, 10) },
  { name: "Kiwifruit", term: "kiwi", months: [...span(0, 3), ...span(9, 11)] },
  { name: "Melons", term: "melon", not: ["watermelon"], months: span(5, 8) },
  { name: "Mulberries", term: "mulberr", months: span(4, 5) },
  { name: "Nectarines", term: "nectarine", months: span(4, 8) },
  { name: "Peaches", term: "peach", months: span(4, 8) },
  { name: "Pears", term: "pear", not: ["prickley pear", "prickly pear"], months: span(8, 11) },
  { name: "Persimmons", term: "persimmon", months: span(8, 10) },
  { name: "Plums", term: "plum", months: span(4, 9) },
  { name: "Raspberries", term: "raspberr", not: ["bushes - raspberr", "raspberry bush"], months: span(4, 9) },
  { name: "Strawberries", term: "strawberr", months: span(1, 10) },
  { name: "Watermelon", term: "watermelon", months: span(6, 8) },
];

export interface SeasonGroup {
  title: string;
  crops: Crop[];
}

// Year-round crops are left out: "in season" should say something.
export function seasonGroups(month: number): SeasonGroup[] {
  const has = (c: Crop, m: number) => c.months.includes((m + 12) % 12);
  const now = CROPS.filter((c) => has(c, month) && c.months.length < 12);
  return [
    { title: "New this month", crops: now.filter((c) => !has(c, month - 1)) },
    { title: "At their peak", crops: now.filter((c) => has(c, month - 1) && has(c, month + 1)) },
    { title: "Last few weeks", crops: now.filter((c) => !has(c, month + 1)) },
  ];
}

// The one-line strip: what just arrived, what is about to end, then the rest.
export function seasonPicks(month: number, count = 9): Crop[] {
  const [fresh, peak, ending] = seasonGroups(month).map((g) => g.crops);
  return [...fresh, ...ending.slice(0, 2), ...peak].slice(0, count);
}

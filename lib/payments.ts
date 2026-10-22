import { PAYMENT_OPTIONS, PaymentID } from "./intake";

// Payment types per MMM vendor ID. Real answers will come from the intake
// form's Sheet; until then the directory shows nothing, or sample data in
// review mode (?preview=payments).
export type PaymentMap = Record<number, PaymentID[]>;

export const PAYMENT_LABELS: Record<PaymentID, string> = Object.fromEntries(
  PAYMENT_OPTIONS.map((p) => [p.id, p.label])
) as Record<PaymentID, string>;

// Short names for badges on cards.
export const PAYMENT_SHORT: Record<PaymentID, string> = {
  cash: "Cash",
  card: "Card",
  ebt: "EBT",
  wic: "WIC",
  sfmnb: "SFMNB",
};

// Benefit programs are what shoppers filter for; cash and card are near universal.
export const BENEFIT_IDS: PaymentID[] = ["ebt", "wic", "sfmnb"];

// Deterministic per vendor, so the review link looks the same on every load.
function hash(n: number, salt: number): number {
  let x = (n * 2654435761 + salt * 40503) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507) >>> 0;
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

export function samplePayments(vendorIDs: number[]): PaymentMap {
  const out: PaymentMap = {};
  for (const id of vendorIDs) {
    const p: PaymentID[] = ["cash"];
    if (hash(id, 1) < 0.85) p.push("card");
    if (hash(id, 2) < 0.4) p.push("ebt");
    if (hash(id, 3) < 0.15) p.push("wic");
    if (hash(id, 4) < 0.2) p.push("sfmnb");
    out[id] = p;
  }
  return out;
}

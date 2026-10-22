import { PAYMENT_OPTIONS, PaymentID } from "./intake";

// Payment types per MMM vendor ID, from the intake form's Sheet. Until that
// is connected the map is empty and the directory shows no payment badges
// or filter.
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

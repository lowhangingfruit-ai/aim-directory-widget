// Shared definitions for the market participant intake form (/intake).
// The form collects fields Manage My Market doesn't hold; answers land in a
// Google Sheet AIM owns (through an Apps Script web app), keyed by MMM vendorID. Later rows for the same
// vendorID supersede earlier ones, so a resubmission or retry is harmless.

// Payment types as AIM listed them. Token colors are still to be confirmed
// with AIM before the form goes out.
export const PAYMENT_OPTIONS = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Credit or debit card" },
  { id: "ebt", label: "EBT / CalFresh tokens" },
  { id: "wic", label: "WIC" },
  { id: "sfmnb", label: "SFMNB" },
] as const;

export type PaymentID = (typeof PAYMENT_OPTIONS)[number]["id"];

// AIM's participant categories, from section 2.1 of the 2027 Farmers Market
// Rules and Regulations. Vendors pick by AIM's name, the one they applied
// under; shoppers see the plain label. Rules 5.11 allows more than one.
export const CATEGORY_OPTIONS = [
  { id: "certified", aimName: "Certified Producer", label: "Farms and produce" },
  { id: "livestock", aimName: "Rancher/Livestock", label: "Meat and poultry" },
  { id: "dairy", aimName: "Dairy", label: "Dairy" },
  { id: "seafood", aimName: "Fisher/Seafood", label: "Seafood" },
  { id: "tff", aimName: "Temporary Food Facility", label: "Prepared food" },
  { id: "prepacked", aimName: "Prepacked", label: "Packaged foods" },
  { id: "commercial", aimName: "Commercial", label: "Other goods and services" },
  { id: "nonprofit", aimName: "Non-Profit", label: "Nonprofits" },
  { id: "entertainer", aimName: "Entertainer", label: "Music and entertainment" },
  { id: "artisan", aimName: "Artisan", label: "Artisans and crafts" },
] as const;

export type CategoryID = (typeof CATEGORY_OPTIONS)[number]["id"];

// Optional follow-up for the two broad categories, so shoppers can find eggs
// or bread specifically. Each product belongs to the category that asks it.
export const PRODUCT_OPTIONS = [
  { id: "produce", label: "Fruits and vegetables", category: "certified" },
  { id: "eggs", label: "Eggs", category: "certified" },
  { id: "honey", label: "Honey", category: "certified" },
  { id: "flowers", label: "Flowers and plants", category: "certified" },
  { id: "nuts", label: "Nuts and grains", category: "certified" },
  { id: "bakery", label: "Bread and baked goods", category: "prepacked" },
  { id: "pantry", label: "Jams and sauces", category: "prepacked" },
  { id: "drinks", label: "Drinks", category: "prepacked" },
  { id: "sweets", label: "Sweets", category: "prepacked" },
] as const satisfies readonly { id: string; label: string; category: CategoryID }[];

export type ProductID = (typeof PRODUCT_OPTIONS)[number]["id"];

export interface IntakeSubmission {
  submissionID: string;
  vendorID: number | null; // null when the business isn't in the MMM list
  businessName: string;
  contactName: string;
  contactEmail: string;
  categories: CategoryID[];
  products: ProductID[];
  payments: PaymentID[];
  otherPayment: string;
  originCity: string;
  shopperNotes: string;
  agreed: boolean;
}

export interface IntakeVendorOption {
  vendorID: number;
  company: string;
  city: string;
}

const LIMITS = {
  businessName: 120,
  contactName: 120,
  contactEmail: 200,
  otherPayment: 120,
  originCity: 80,
  shopperNotes: 600,
};

const PAYMENT_IDS = new Set<string>(PAYMENT_OPTIONS.map((p) => p.id));
const CATEGORY_IDS = new Set<string>(CATEGORY_OPTIONS.map((c) => c.id));

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// Validates an untrusted request body. Returns the cleaned submission, or a
// message safe to show the person filling in the form.
export function parseSubmission(
  body: unknown
): { ok: true; value: IntakeSubmission } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Please fill in the form." };
  const b = body as Record<string, unknown>;

  const submissionID = str(b.submissionID, 64);
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(submissionID)) return { ok: false, error: "Please reload the page and try again." };

  const vendorID = typeof b.vendorID === "number" && Number.isInteger(b.vendorID) && b.vendorID > 0 ? b.vendorID : null;
  const businessName = str(b.businessName, LIMITS.businessName);
  if (!businessName) return { ok: false, error: "Please choose or enter your business." };

  const contactName = str(b.contactName, LIMITS.contactName);
  if (!contactName) return { ok: false, error: "Please add your name." };

  const contactEmail = str(b.contactEmail, LIMITS.contactEmail);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { ok: false, error: "Please check your email address." };
  }

  const categories = Array.isArray(b.categories)
    ? [...new Set(b.categories.filter((c): c is CategoryID => typeof c === "string" && CATEGORY_IDS.has(c)))]
    : [];
  if (categories.length === 0) return { ok: false, error: "Please choose your AIM category." };
  // Keep only products whose category was chosen.
  const products = Array.isArray(b.products)
    ? [...new Set(b.products.filter((p): p is ProductID =>
        PRODUCT_OPTIONS.some((o) => o.id === p && categories.includes(o.category))))]
    : [];

  const payments = Array.isArray(b.payments)
    ? (b.payments.filter((p) => typeof p === "string" && PAYMENT_IDS.has(p)) as PaymentID[])
    : [];
  const otherPayment = str(b.otherPayment, LIMITS.otherPayment);
  if (payments.length === 0 && !otherPayment) return { ok: false, error: "Please choose at least one payment type." };

  if (b.agreed !== true) return { ok: false, error: "Please check the box so AIM can show your answers in the directory." };

  return {
    ok: true,
    value: {
      submissionID,
      vendorID,
      businessName,
      contactName,
      contactEmail,
      categories,
      products,
      payments: [...new Set(payments)],
      otherPayment,
      originCity: str(b.originCity, LIMITS.originCity),
      shopperNotes: str(b.shopperNotes, LIMITS.shopperNotes),
      agreed: true,
    },
  };
}

// Column order of the AIM response Sheet. Keep in step with toSheetRow.
export const SHEET_HEADERS = [
  "Submitted at",
  "Submission ID",
  "MMM vendor ID",
  "Business name",
  "Contact name",
  "Contact email",
  "AIM categories",
  "Mainly sells",
  "Payment types",
  "Other payment",
  "Grows or makes in",
  "Notes for shoppers",
  "Agreed to show in directory",
];

export function toSheetRow(s: IntakeSubmission, submittedAt: Date): string[] {
  const labels = s.payments.map((id) => PAYMENT_OPTIONS.find((p) => p.id === id)?.label ?? id);
  const categories = s.categories.map((id) => CATEGORY_OPTIONS.find((c) => c.id === id)?.aimName ?? id);
  const products = s.products.map((id) => PRODUCT_OPTIONS.find((p) => p.id === id)?.label ?? id);
  return [
    submittedAt.toISOString(),
    s.submissionID,
    s.vendorID === null ? "" : String(s.vendorID),
    s.businessName,
    s.contactName,
    s.contactEmail,
    categories.join(", "),
    products.join(", "),
    labels.join(", "),
    s.otherPayment,
    s.originCity,
    s.shopperNotes,
    s.agreed ? "Yes" : "No",
  ];
}

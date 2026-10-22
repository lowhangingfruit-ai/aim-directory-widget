"use client";

import { useMemo, useState } from "react";
import { CATEGORY_OPTIONS, CategoryID, PAYMENT_OPTIONS, PaymentID, PRODUCT_OPTIONS, ProductID, IntakeVendorOption } from "@/lib/intake";

interface Props {
  vendors: IntakeVendorOption[];
}

const AIM_GREEN = "#0d8240";
const AIM_BRIGHT = "#4db547";
const CREAM = "#f6f5ea";
const BORDER = "#c9c7b8";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-heading)",
  fontWeight: 500,
  fontSize: 17,
  color: "#000",
  marginBottom: 4,
};

const helperStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6f6d5f",
  lineHeight: 1.5,
  margin: "0 0 8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  color: "#000",
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 0,
  outline: "none",
  boxSizing: "border-box",
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  marginTop: 8,
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  color: AIM_GREEN,
  fontWeight: 600,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 26 }}>{children}</div>;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={{
      padding: "7px 16px", borderRadius: 300, cursor: "pointer",
      fontFamily: "var(--font-body)", fontSize: 13.5,
      border: `1.5px solid ${active ? AIM_GREEN : BORDER}`,
      backgroundColor: active ? AIM_GREEN : "#fff",
      color: active ? "#fff" : "#333",
      fontWeight: active ? 600 : 400,
      transition: "all 0.12s ease",
    }}>
      {label}
    </button>
  );
}

function toggleIn<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function newSubmissionID(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function IntakeForm({ vendors }: Props) {
  // One ID per page load, so a double click or retry is recognizable in the Sheet.
  const [submissionID] = useState(newSubmissionID);
  const [query, setQuery] = useState("");
  const [vendor, setVendor] = useState<IntakeVendorOption | null>(null);
  const [unlisted, setUnlisted] = useState(false);
  const [unlistedName, setUnlistedName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [categories, setCategories] = useState<Set<CategoryID>>(new Set());
  const [products, setProducts] = useState<Set<ProductID>>(new Set());
  const [payments, setPayments] = useState<Set<PaymentID>>(new Set());
  const [otherPayment, setOtherPayment] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [shopperNotes, setShopperNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || vendor) return [];
    return vendors.filter((v) => v.company.toLowerCase().includes(q)).slice(0, 8);
  }, [query, vendor, vendors]);

  const togglePayment = (id: PaymentID) => setPayments((prev) => toggleIn(prev, id));
  const toggleProduct = (id: ProductID) => setProducts((prev) => toggleIn(prev, id));
  const toggleCategory = (id: CategoryID) => {
    const next = toggleIn(categories, id);
    setCategories(next);
    // Drop follow-up answers for a category that was unchecked.
    setProducts((p) => new Set([...p].filter((pid) => next.has(PRODUCT_OPTIONS.find((o) => o.id === pid)!.category))));
  };
  const productChoices = PRODUCT_OPTIONS.filter((o) => categories.has(o.category));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const businessName = unlisted ? unlistedName.trim() : vendor?.company ?? "";
    if (!businessName) return setError("Please choose or enter your business.");
    if (!contactName.trim()) return setError("Please add your name.");
    if (categories.size === 0) return setError("Please choose your AIM category.");
    if (payments.size === 0 && !otherPayment.trim()) return setError("Please choose at least one payment type.");
    if (!agreed) return setError("Please check the box so AIM can show your answers in the directory.");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionID,
          vendorID: unlisted ? null : vendor?.vendorID ?? null,
          businessName,
          contactName,
          contactEmail,
          categories: [...categories],
          products: [...products],
          payments: [...payments],
          otherPayment,
          originCity,
          shopperNotes,
          agreed,
          website_url: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong saving your answers. Please try again in a minute.");
        return;
      }
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    const first = contactName.trim().split(" ")[0];
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 300, margin: "0 auto 20px",
            backgroundColor: AIM_BRIGHT, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 34, color: AIM_GREEN, marginBottom: 14 }}>
            Thank you{first ? `, ${first}` : ""}!
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: "0 0 22px" }}>
            We have your details. They&rsquo;ll appear in the Market Participant Directory
            when it launches. If anything changes, you can fill in this form again and
            your newest answers will be used.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em",
            color: AIM_GREEN, marginBottom: 10,
          }}>
            Agricultural Institute of Marin
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 36, lineHeight: 1.15, color: AIM_GREEN, marginBottom: 14 }}>
            Help shoppers find you
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 auto", maxWidth: 520 }}>
            AIM is launching a new Market Participant Directory on our website. Shoppers will
            be able to look up your business, see which markets you&rsquo;re at and when, and
            check how they can pay at your booth. This form collects the details Manage My
            Market doesn&rsquo;t hold. It takes about two minutes.
          </p>
        </div>

        <div style={{ backgroundColor: CREAM, border: `1px solid ${BORDER}`, padding: "18px 20px", marginBottom: 36 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 18, margin: "0 0 8px" }}>
            What the directory shows
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.65, listStyle: "disc", display: "flex", flexDirection: "column", gap: 4 }}>
            <li>From your Manage My Market profile: your business name, description, city, phone, website and social links, and your market dates.</li>
            <li>From this form: your category, what you mainly sell, the payment types you accept, and where you grow or make your products.</li>
            <li>It never shows your email or street address.</li>
            <li>
              Only businesses that checked the box in Manage My Market allowing AIM to share
              their information are included. You can change that answer in your Manage My
              Market profile at any time.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="website_url">Leave this empty</label>
            <input id="website_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          <Field>
            <label style={labelStyle} htmlFor="business">Your business</label>
            {unlisted ? (
              <>
                <p style={helperStyle}>
                  Only businesses that allow sharing in Manage My Market appear in the list. Enter
                  your business name and AIM will follow up.
                </p>
                <input id="business" style={inputStyle} value={unlistedName} onChange={(e) => setUnlistedName(e.target.value)} />
                <button type="button" style={linkButtonStyle} onClick={() => { setUnlisted(false); setUnlistedName(""); }}>
                  Search the list instead
                </button>
              </>
            ) : vendor ? (
              <div style={{
                ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                borderColor: AIM_GREEN, backgroundColor: "#f3f9f2",
              }}>
                <span>
                  <strong>{vendor.company}</strong>
                  {vendor.city && <span style={{ color: "#6f6d5f" }}> &middot; {vendor.city}</span>}
                </span>
                <button type="button" style={{ ...linkButtonStyle, marginTop: 0 }} onClick={() => { setVendor(null); setQuery(""); }}>
                  Change
                </button>
              </div>
            ) : (
              <>
                <p style={helperStyle}>Start typing your business name, then choose it from the list.</p>
                <input
                  id="business"
                  style={inputStyle}
                  value={query}
                  autoComplete="off"
                  onChange={(e) => setQuery(e.target.value)}
                />
                {matches.length > 0 && (
                  <ul role="listbox" style={{ listStyle: "none", margin: 0, padding: 0, border: `1px solid ${BORDER}`, borderTop: "none" }}>
                    {matches.map((v) => (
                      <li key={v.vendorID}>
                        <button type="button" onClick={() => setVendor(v)} style={{
                          display: "block", width: "100%", textAlign: "left", padding: "10px 12px",
                          background: "#fff", border: "none", borderBottom: `1px solid ${CREAM}`, cursor: "pointer",
                          fontFamily: "var(--font-body)", fontSize: 14.5, color: "#000",
                        }}>
                          {v.company}
                          {v.city && <span style={{ color: "#6f6d5f" }}> &middot; {v.city}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {query.trim().length >= 2 && matches.length === 0 && (
                  <p style={{ ...helperStyle, marginTop: 8 }}>No match yet. Try a shorter part of the name.</p>
                )}
                <button type="button" style={linkButtonStyle} onClick={() => setUnlisted(true)}>
                  My business isn&rsquo;t listed
                </button>
              </>
            )}
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="contactName">Your name</label>
            <input id="contactName" style={inputStyle} autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="contactEmail">Your email (optional)</label>
            <p style={helperStyle}>Only AIM staff see this, in case we have a question. It isn&rsquo;t shown in the directory.</p>
            <input id="contactEmail" type="email" style={inputStyle} autoComplete="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle}>Your AIM category</label>
            <p style={helperStyle}>
              Choose the category you applied under. If you sell across more than one, choose
              each that applies.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {CATEGORY_OPTIONS.map((c) => (
                <Chip key={c.id} label={c.aimName} active={categories.has(c.id)} onClick={() => toggleCategory(c.id)} />
              ))}
            </div>
          </Field>

          {productChoices.length > 0 && (
            <Field>
              <label style={labelStyle}>What do you mainly sell? (optional)</label>
              <p style={helperStyle}>Choose all that apply. This helps shoppers looking for something specific find you.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {productChoices.map((o) => (
                  <Chip key={o.id} label={o.label} active={products.has(o.id)} onClick={() => toggleProduct(o.id)} />
                ))}
              </div>
            </Field>
          )}

          <Field>
            <label style={labelStyle}>Which payment types do you accept?</label>
            <p style={helperStyle}>Choose all that apply. Shoppers will be able to filter the directory by these.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {PAYMENT_OPTIONS.map((p) => {
                const active = payments.has(p.id);
                return (
                  <button key={p.id} type="button" aria-pressed={active} onClick={() => togglePayment(p.id)} style={{
                    padding: "7px 16px", borderRadius: 300, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontSize: 13.5,
                    border: `1.5px solid ${active ? AIM_GREEN : BORDER}`,
                    backgroundColor: active ? AIM_GREEN : "#fff",
                    color: active ? "#fff" : "#333",
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.12s ease",
                  }}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <input
              style={{ ...inputStyle, marginTop: 10 }}
              placeholder="Anything else? For example, Venmo"
              aria-label="Other payment types"
              value={otherPayment}
              onChange={(e) => setOtherPayment(e.target.value)}
            />
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="originCity">Where do you grow or make your products? (optional)</label>
            <p style={helperStyle}>
              A town or city is enough. This places you on the directory map. Leave it blank to
              use the city on your Manage My Market profile.
            </p>
            <input id="originCity" style={inputStyle} placeholder="For example, Petaluma" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="shopperNotes">Anything shoppers should know about paying at your booth? (optional)</label>
            <textarea id="shopperNotes" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              value={shopperNotes} onChange={(e) => setShopperNotes(e.target.value)} />
          </Field>

          <Field>
            <div style={{
              backgroundColor: CREAM, border: `1px solid ${BORDER}`, padding: "16px 18px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <input id="agreed" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: AIM_GREEN, flexShrink: 0 }} />
              <label htmlFor="agreed" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#333", cursor: "pointer" }}>
                AIM can show my category, products, payment types and location from this form
                in the Market Participant Directory. My name and email are only for AIM staff.
              </label>
            </div>
          </Field>

          {error && (
            <p role="alert" style={{ margin: "0 0 16px", fontSize: 14, color: "#b3372a", fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" disabled={sending} style={{
            padding: "13px 34px", borderRadius: 300, cursor: sending ? "default" : "pointer",
            backgroundColor: AIM_GREEN, color: "#fff", border: "none", opacity: sending ? 0.7 : 1,
            fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15.5, letterSpacing: "0.02em",
          }}>
            {sending ? "Sending..." : "Send my details"}
          </button>
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "#8a8878" }}>
            Questions? Reply to the email this link came in, and the AIM markets team will help.
          </p>
        </form>
      </div>
    </div>
  );
}
